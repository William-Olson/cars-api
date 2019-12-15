import { OK, BAD_REQUEST, UNPROCESSABLE_ENTITY } from 'http-status-codes';
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
  public async getBodyStyles(req: Request, res: Response): Promise<PagedResponse<BodyStyle>>
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

    res.status(OK);
    return result;
  }

  @Get('/:id')
  public async getBodyStyleById(req: Request, res: Response): Promise<BodyStyle>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.bodyStyleRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find body-style with id ${id}`);
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
    return result;
  }

  @Put('/:id')
  public async updateBodyStyle(req: Request, res: Response): Promise<BodyStyle>
  {
    // validate uniqueness of name
    const nameExists = await this.bodyStyleRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A body-style with the name '${req.body.name}' already exists`);
    }

    // update
    await this.bodyStyleRepo.createQueryBuilder()
      .update(BodyStyle)
      .set({ name: req.body.name.toLowerCase() })
      .where('id = :id', { id: req.body.id })
      .execute();

    // fetch and return updated
    const result = await this.bodyStyleRepo.findOne(req.body.id);
    if (!result) {
      throw new ErrorResponse(500, 'Unable to retrieve updated entity');
    }
    return result;
  }

  @Delete('/:id')
  public async deleteBodyStyle(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.bodyStyleRepo.createQueryBuilder()
      .delete()
      .from(BodyStyle)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete body-style with id ${id}`);
    }

    return { success: true };

  }


}

export default BodyStyleRouter;
