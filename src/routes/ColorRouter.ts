import { OK, BAD_REQUEST, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository, Not, Equal } from 'typeorm';

import LoggerFactory, { DebugFn } from '../services/LoggerFactory';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import Color from '../models/Color';


@injectable()
@Controller('colors')
@ClassWrapper(harness)
export class ColorRouter {

  private logger: DebugFn;
  private bodyStyleRepo: Repository<Color>;

  constructor(loggerFactory: LoggerFactory, private db: DbService)
  {
    this.logger = loggerFactory.getLogger('app:routes:ColorRouter');
    this.bodyStyleRepo = this.db.repo(Color);
  }

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

    res.status(OK);
    return result;
  }

  @Get('/:id')
  public async getColorById(req: Request, res: Response): Promise<Color>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.bodyStyleRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find color with id ${id}`);
    }

    return result;
  }

  @Post()
  public async createColor(req: Request, res: Response): Promise<Color>
  {
    // validate uniqueness of name
    const nameExists = await this.bodyStyleRepo.findOne({
      where: { name: req.body.name.toLowerCase() }
    });

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A color with the name '${req.body.name}' already exists`);
    }

    // create the new make
    const newColor: Color = new Color();
    newColor.name = req.body.name.toLowerCase();
    const result = await this.bodyStyleRepo.save(newColor);
    return result;
  }

  @Put('/:id')
  public async updateColor(req: Request, res: Response): Promise<Color>
  {
    // validate uniqueness of name
    const nameExists = await this.bodyStyleRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A color with the name '${req.body.name}' already exists`);
    }

    // update
    await this.bodyStyleRepo.createQueryBuilder()
      .update(Color)
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
  public async deleteColor(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.bodyStyleRepo.createQueryBuilder()
      .delete()
      .from(Color)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete color with id ${id}`);
    }

    return { success: true };

  }


}

export default ColorRouter;
