import { BAD_REQUEST, UNPROCESSABLE_ENTITY, CREATED, NOT_FOUND } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository, Not, Equal } from 'typeorm';
import {
  ApiPath,
  ApiOperationGet,
  SwaggerDefinitionConstant,
  ApiOperationPut,
  ApiOperationDelete,
  ApiOperationPost
} from 'swagger-express-ts';

import LoggerFactory, { DebugFn } from '../services/LoggerFactory';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import Make from '../models/Make';
import { PagedMakes } from './util/swagger-models/PagedResponses';
import { DeletionResponse } from './util/swagger-models/DeletionResponse';
import { EntityInput } from './util/swagger-models/EntityInput';

@ApiPath({
  path: '/makes',
  name: 'Makes'
})
@injectable()
@Controller('makes')
@ClassWrapper(harness)
export class MakeRouter {

  private logger: DebugFn;
  private makeRepo: Repository<Make>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:MakeRouter');
    this.makeRepo = this.db.repo(Make);
  }

  @ApiOperationGet({
    description: 'Fetch all Makes',
    summary: 'Fetch Makes',
    parameters: {
      query: {
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedMakes.name },
        400: { description: 'Bad Parameters' }
    }
  })
  @Get()
  public async getMakes(req: Request, res: Response): Promise<PagedResponse<Make>>
  {
    // parse params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Malformed query params');
    }

    const result = await this.db.pagedQuery(Make, {
      take: limit,
      skip: offset
    });

    return result;
  }

  @ApiOperationGet({
    description: 'Get a Make by its ID',
    path: '/{id}',
    summary: 'Get Make by ID',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Make', required: true } }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: 'Make' },
        400: { description: 'Bad Parameters' },
        404: { description: 'Not Found' }
    }
  })
  @Get(':id')
  public async getMakeById(req: Request): Promise<Make>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.makeRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(NOT_FOUND, `Can't find make with id ${id}`);
    }

    return result;
  }

  @ApiOperationPost({
    description: 'Create a Make',
    summary: 'Create Make',
    parameters: {
      body: { description: 'The Make to create', required: true, model: EntityInput.name }
    },
    responses: {
        201: {
          description: 'Created',
          type: SwaggerDefinitionConstant.Response.Type.OBJECT,
          model: Make.name
        },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Post()
  public async createMake(req: Request, res: Response): Promise<Make>
  {
    // validate uniqueness of name
    const nameExists = await this.makeRepo.findOne({
      where: { name: req.body.name.toLowerCase() }
    });

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A make with the name '${req.body.name}' already exists`);
    }

    // create the new make
    const newMake: Make = new Make();
    newMake.name = req.body.name.toLowerCase();
    const result = await this.makeRepo.save(newMake);
    res.status(CREATED);
    return result;
  }

  @ApiOperationPut({
    description: 'Update a Make by its ID',
    path: '/{id}',
    summary: 'Update Make',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Make to update', required: true } }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: Make.name },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Put(':id')
  public async updateMake(req: Request, res: Response): Promise<Make>
  {
    if (!req.body.name) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing name field');
    }

    // validate uniqueness of name
    const nameExists = await this.makeRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A make with the name '${req.body.name}' already exists`);
    }

    // fetch entry
    const make = await this.makeRepo.findOne(req.params.id);
    if (!make) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find make with id ${req.params.id}`);
    }

    // update it
    make.name = req.body.name.toLowerCase();
    return await this.makeRepo.save(make);
  }

  @ApiOperationDelete({
    description: 'Delete a Make by ID',
    path: '/{id}',
    summary: 'Delete Make',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Make to delete', required: true } }
    },
    responses: {
        200: {
          description: 'Success',
          type: SwaggerDefinitionConstant.Response.Type.OBJECT,
          model: DeletionResponse.name
        },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Delete(':id')
  public async deleteMake(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const make = await this.makeRepo.findOne(id);
    if (!make) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find make with id ${id}`);
    }

    // delete
    const result = await this.makeRepo.createQueryBuilder()
      .delete()
      .from(Make)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete make with id ${id}`);
    }

    return {
      success: true,
      message: `Deleted make with id ${id}`
    };

  }


}

export default MakeRouter;
