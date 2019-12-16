import { BAD_REQUEST, UNPROCESSABLE_ENTITY, CREATED, NOT_FOUND } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository } from 'typeorm';

import LoggerFactory, { DebugFn } from '../services/LoggerFactory';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import Car from '../models/Car';
import Model from '../models/Model';


@injectable()
@Controller('cars')
@ClassWrapper(harness)
export class CarRouter {

  private logger: DebugFn;
  private carRepo: Repository<Car>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:CarRouter');
    this.carRepo = this.db.repo(Car);
  }

  @Get()
  public async getCars(req: Request, res: Response): Promise<PagedResponse<Car>>
  {
    // parse params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Malformed query params');
    }

    const result = await this.db.pagedQuery(Car, {
      take: limit,
      skip: offset,
      relations: ['color', 'model', 'model.make', 'model.bodyStyle' ]
    });

    return result;
  }

  @Get(':id')
  public async getCarById(req: Request, res: Response): Promise<Car>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.carRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(NOT_FOUND, `Can't find car with id ${id}`);
    }

    return result;
  }

  @Post()
  public async createCar(req: Request, res: Response): Promise<Car>
  {
    const newCar: Car = await this.validateCarAndGetNewModel(req.body);
    const result = await this.carRepo.save(newCar);
    res.status(CREATED);
    return result;
  }

  @Put(':id')
  public async updateCar(req: Request, res: Response): Promise<Car>
  {
    // validate
    const inputModel: Car = await this.validateCarAndGetNewModel(req.body, req.params.id);

    // update
    await this.carRepo.createQueryBuilder()
      .update(Car)
      .set(inputModel)
      .where('id = :id', { id: req.body.id })
      .execute();

    // fetch and return updated
    const result = await this.carRepo.findOne(req.body.id);
    if (!result) {
      throw new ErrorResponse(500, 'Unable to retrieve updated entity');
    }
    return result;
  }

  @Delete(':id')
  public async deleteCar(req: Request)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const car = await this.carRepo.findOne(id);
    if (!car) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find car with id ${id}`);
    }

    const result = await this.carRepo.createQueryBuilder()
      .delete()
      .from(Car)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete car with id ${id}`);
    }

    return {
      success: true,
      message: `Deleted car with id ${id}`
    };

  }

  /*

    Validate and inflate a POST or PUT request body for creating or updating a car.

  */
  private async validateCarAndGetNewModel(input, id?): Promise<Car>
  {

    if (!input.modelId) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing modelId field');
    }

    if (!input.colorId) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing colorId field');
    }

    if (!input.year) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing year field');
    }

    const year: number = parseInt(input.year, 10);
    if (isNaN(year) || year < 1000 || year > 9999) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for year field');
    }

    // grab model with its available colors
    const model = await this.db.repo(Model).findOne({
      where: { id: input.modelId },
      relations: [ 'availableColors' ]
    });

    if (!model) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find model with id ${input.modelId}`);
    }

    const color = (model.availableColors || [ ]).find(c => `${c.id}` === `${input.colorId}`);
    if (!color) {
      throw new ErrorResponse(
        UNPROCESSABLE_ENTITY,
        `Color with id ${input.colorId} is not available for model ${input.modelId}`
      );
    }

    // establish existing or new car model
    let car: Car | undefined;
    if (id) {
      car = await this.carRepo.findOne(id);
      if (!car) {
        throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find car with id ${id}`);
      }
    }
    else {
      car = new Car();
    }

    // set validated data
    car.color = color;
    car.model = model;
    car.year = year;

    return car;
  }

}

export default CarRouter;
