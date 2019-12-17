import { BAD_REQUEST, UNPROCESSABLE_ENTITY, CREATED, NOT_FOUND } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository, Not, Equal, In } from 'typeorm';
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
import Model from '../models/Model';
import Make from '../models/Make';
import Color from '../models/Color';
import BodyStyle from '../models/BodyStyle';
import { PagedModels } from './util/swagger-models/PagedResponses';
import { DeletionResponse } from './util/swagger-models/DeletionResponse';
import { ModelInput } from './util/swagger-models/EntityInput';

@ApiPath({
  path: '/models',
  name: 'Models'
})
@injectable()
@Controller('models')
@ClassWrapper(harness)
export class ModelRouter {

  private logger: DebugFn;
  private modelRepo: Repository<Model>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:ModelRouter');
    this.modelRepo = this.db.repo(Model);
  }

  @ApiOperationGet({
    description: 'Fetch all Models',
    summary: 'Fetch Models',
    parameters: {
      query: {
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedModels.name },
        400: { description: 'Bad Parameters' }
    }
  })
  @Get()
  public async getModels(req: Request, res: Response): Promise<PagedResponse<Model>>
  {
    // parse params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Malformed query params');
    }

    const result = await this.db.pagedQuery(Model, {
      take: limit,
      skip: offset,
      relations: [ 'availableColors', 'bodyStyle', 'make' ]
    });

    return result;
  }

  @ApiOperationGet({
    description: 'Get a Model by its ID',
    path: '/{id}',
    summary: 'Get Model by ID',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Model', required: true } }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: 'Model' },
        400: { description: 'Bad Parameters' },
        404: { description: 'Not Found' }
    }
  })
  @Get(':id')
  public async getModelById(req: Request, res: Response): Promise<Model>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.modelRepo.findOne({
      where: { id },
      relations: [ 'availableColors', 'bodyStyle', 'make' ]
    });

    if (!result) {
      throw new ErrorResponse(NOT_FOUND, `Can't find model with id ${id}`);
    }

    return result;
  }

  @ApiOperationPost({
    description: 'Create a Model',
    summary: 'Create Model',
    parameters: {
      body: { description: 'The Model to create', required: true, model: ModelInput.name }
    },
    responses: {
        200: {
          description: 'Success',
          type: SwaggerDefinitionConstant.Response.Type.OBJECT,
          model: Model.name
        },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Post()
  public async createModel(req: Request, res: Response): Promise<Model>
  {

    const newModel: Model = await this.validateAndInflateModel(req.body);
    const result = await this.modelRepo.save(newModel);
    res.status(CREATED);
    return result;

  }

  @ApiOperationPut({
    description: 'Update a Model by its ID',
    path: '/{id}',
    summary: 'Update Model',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Model to update', required: true } },
      body: { description: 'The Model data to update', required: true, model: ModelInput.name }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: Model.name },
        400: { description: 'Bad Parameters' },
        422: { description: 'Unprocessable Entity' }
    }
  })
  @Put(':id')
  public async updateModel(req: Request, res: Response): Promise<Model>
  {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad input for id '${req.params.id}'`);
    }

    const modelToUpdate: Model = await this.validateAndInflateModel(req.body, id);

    // update
    const result = await this.modelRepo.save(modelToUpdate);
    if (!result) {
      throw new ErrorResponse(500, 'Unable to retrieve updated entity');
    }
    return result;
  }

  @ApiOperationDelete({
    description: 'Delete a Model by ID',
    path: '/{id}',
    summary: 'Delete Model',
    parameters: {
      path: { id: { name: 'id', description: 'The ID of the Model to delete', required: true } }
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
  public async deleteModel(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    // remove entries in join table
    const model = await this.modelRepo.save({ id, availableColors: [ ] });

    if (!model) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find model with id ${id}`);
    }

    const result = await this.modelRepo.createQueryBuilder()
      .delete()
      .from(Model)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete model with id ${id}`);
    }

    return {
      success: true,
      message: `Deleted model with id ${id}`
    };

  }

  /*

    Validate and inflate a model entry from an input and optional id.
    Returns a new Model if 'id' is not passed as an argument.

  */
  private async validateAndInflateModel(input, id?): Promise<Model>
  {

    // required input checks
    if (!input.makeId) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing makeId field');
    }

    if (!input.colorIds) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing colorIds field');
    }

    if (!input.name) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing name field');
    }

    if (!input.bodyStyleId) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing bodyStyleId field');
    }


    // validate uniqueness of name
    const nameSearch = { name: input.name.toLowerCase() };

    // ignore same id if updating
    const hasName = id ? Object.assign(nameSearch, {
      id: Not(Equal(id))
    }) : nameSearch;

    const nameExists = await this.modelRepo.findOne({ where: hasName });

    if (nameExists) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `A model with the name '${input.name}' already exists`);
    }


    // resolve make
    const make = await this.db.repo(Make).findOne(input.makeId);
    if (!make) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find make with id ${input.makeId}`);
    }

    // resolve bodyStyle
    const bodyStyle = await this.db.repo(BodyStyle).findOne(input.bodyStyleId);
    if (!bodyStyle) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find body-style with id ${input.bodyStyleId}`);
    }

    // resolve colors
    let colors: Color[] = [ ];
    if (input.colorIds.length) {
      colors = await this.db.repo(Color).find({ id: In(input.colorIds) }) || [ ];
      const resultColorIdSet = new Set(colors.map(c => c.id));
      const notFound = input.colorIds.find(colorId => !resultColorIdSet.has(colorId));

      if (notFound) {
        throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find color with id ${notFound}`);
      }
    }

    // inflate model
    let model: Model = new Model();
    if (id) {
      const found = await this.modelRepo.findOne(id);
      if (!found) {
        throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find model with id ${id}`);
      }
      model = found;
    }

    // set validated data
    model.make = make;
    model.bodyStyle = bodyStyle;
    model.availableColors = colors;
    model.name = input.name.toLowerCase();

    return model;
  }


}

export default ModelRouter;
