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
import Color from '../models/Color';
import { PagedColors } from './util/swagger-models/PagedResponses';
import { DeletionResponse } from './util/swagger-models/DeletionResponse';
import { EntityInput } from './util/swagger-models/EntityInput';

@ApiPath({
  path: '/colors',
  name: 'Colors'
})
@injectable()
@Controller('colors')
@ClassWrapper(harness)
export class ColorRouter {

  private logger: DebugFn;
  private colorRepo: Repository<Color>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:ColorRouter');
    this.colorRepo = this.db.repo(Color);
  }

  @ApiOperationGet({
    description: 'Fetch all Colors',
    summary: 'Fetch Colors',
    parameters: {
      query: {
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedColors.name },
        400: { description: 'Bad Parameters' }
    }
  })
  @Get()
  public async getColors(req: Request, res: Response): Promise<PagedResponse<Color>>
  {
    // parse params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Malformed query params');
    }

    const result = await this.db.pagedQuery(Color, {
      take: limit,
      skip: offset
    });

    return result;
  }

  @ApiOperationGet({
    description: 'Get a Color by its ID',
    path: '/{id}',
    summary: 'Get Color by ID',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Color', required: true } }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: 'Color' },
        400: { description: 'Bad Parameters' },
        404: { description: 'Not Found' }
    }
  })
  @Get(':id')
  public async getColorById(req: Request, res: Response): Promise<Color>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.colorRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(NOT_FOUND, `Can't find color with id ${id}`);
    }

    return result;
  }

  @ApiOperationPost({
    description: 'Create a Color',
    summary: 'Create Color',
    parameters: {
      body: { description: 'The Color to create', required: true, model: EntityInput.name }
    },
    responses: {
        200: {
          description: 'Success',
          type: SwaggerDefinitionConstant.Response.Type.OBJECT,
          model: Color.name
        },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Post()
  public async createColor(req: Request, res: Response): Promise<Color>
  {
    // validate uniqueness of name
    const nameExists = await this.colorRepo.findOne({
      where: { name: req.body.name.toLowerCase() }
    });

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A color with the name '${req.body.name}' already exists`);
    }

    // create the new make
    const newColor: Color = new Color();
    newColor.name = req.body.name.toLowerCase();
    const result = await this.colorRepo.save(newColor);
    res.status(CREATED);
    return result;
  }

  @ApiOperationPut({
    description: 'Update a Color by its ID',
    path: '/{id}',
    summary: 'Update Color',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Color to update', required: true } }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: Color.name },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Put(':id')
  public async updateColor(req: Request, res: Response): Promise<Color>
  {
    if (!req.body.name) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing name field');
    }

    // validate uniqueness of name
    const nameExists = await this.colorRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A color with the name '${req.body.name}' already exists`);
    }

    // fetch entry
    const color = await this.colorRepo.findOne(req.params.id);
    if (!color) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find color with id ${req.params.id}`);
    }

    // update it
    color.name = req.body.name.toLowerCase();
    return await this.colorRepo.save(color);
  }

  @ApiOperationDelete({
    description: 'Delete a Color by ID',
    path: '/{id}',
    summary: 'Delete Color',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Color to delete', required: true } }
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
  public async deleteColor(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const color = await this.colorRepo.findOne(id);
    if (!color) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find color with id ${id}`);
    }

    const result = await this.colorRepo.createQueryBuilder()
      .delete()
      .from(Color)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete color with id ${id}`);
    }

    return {
      success: true,
      message: `Deleted color with id ${id}`
    };

  }


}

export default ColorRouter;
