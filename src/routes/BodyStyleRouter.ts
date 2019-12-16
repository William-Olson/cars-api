import { BAD_REQUEST, UNPROCESSABLE_ENTITY, CREATED, NOT_FOUND } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository, Not, Equal } from 'typeorm';

import LoggerFactory, { DebugFn } from '../services/LoggerFactory';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import BodyStyle from '../models/BodyStyle';


@injectable()
@Controller('body-styles')
@ClassWrapper(harness)
export class BodyStyleRouter {

  private logger: DebugFn;
  private bodyStyleRepo: Repository<BodyStyle>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:BodyStyleRouter');
    this.bodyStyleRepo = this.db.repo(BodyStyle);
  }

  @Get()
  public async getBodyStyles(req: Request): Promise<PagedResponse<BodyStyle>>
  {
    // parse params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);

    if (isNaN(limit) || isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Malformed query params');
    }

    const result = await this.db.pagedQuery(BodyStyle, {
      take: limit,
      skip: offset
    });

    return result;
  }

  @Get(':id')
  public async getBodyStyleById(req: Request): Promise<BodyStyle>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.bodyStyleRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(NOT_FOUND, `Can't find body-style with id ${id}`);
    }

    return result;
  }

  @Post()
  public async createBodyStyle(req: Request, res: Response): Promise<BodyStyle>
  {
    // validate uniqueness of name
    const nameExists = await this.bodyStyleRepo.findOne({
      where: { name: req.body.name.toLowerCase() }
    });

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A body-style with the name '${req.body.name}' already exists`);
    }

    // create the new make
    const newBodyStyle: BodyStyle = new BodyStyle();
    newBodyStyle.name = req.body.name.toLowerCase();
    const result = await this.bodyStyleRepo.save(newBodyStyle);
    res.status(CREATED);
    return result;
  }

  @Put(':id')
  public async updateBodyStyle(req: Request): Promise<BodyStyle>
  {
    if (!req.body.name) {
      throw new ErrorResponse(BAD_REQUEST, 'Missing name field');
    }

    // validate uniqueness of name
    const nameExists = await this.bodyStyleRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A body-style with the name '${req.body.name}' already exists`);
    }

    // fetch entry
    const bodyStyle = await this.bodyStyleRepo.findOne(req.params.id);
    if (!bodyStyle) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find body-style with id ${req.params.id}`);
    }

    // update it
    bodyStyle.name = req.body.name.toLowerCase();
    return await this.bodyStyleRepo.save(bodyStyle);

  }

  @Delete(':id')
  public async deleteBodyStyle(req: Request)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const bodyStyle = await this.bodyStyleRepo.findOne(id);
    if (!bodyStyle) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find body-style with id ${id}`);
    }

    const result = await this.bodyStyleRepo.createQueryBuilder()
      .delete()
      .from(BodyStyle)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete body-style with id ${id}`);
    }

    return {
      success: true,
      message: `Deleted body-style with id ${id}`
    };

  }


}

export default BodyStyleRouter;
