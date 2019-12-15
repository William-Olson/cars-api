import { OK, BAD_REQUEST, UNPROCESSABLE_ENTITY } from 'http-status-codes';
import { Controller, Post, ClassWrapper, Get, Put, Delete } from '@overnightjs/core';
import { injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { DbService, PagedResponse } from '../services/DbService';
import { Repository, Not, Equal } from 'typeorm';

import LoggerFactory, { DebugFn } from '../services/LoggerFactory';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import Make from '../models/Make';


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

    res.status(OK);
    return result;
  }

  @Get('/:id')
  public async getMakeById(req: Request, res: Response): Promise<Make>
  {
    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.makeRepo.findOne(id);

    if (!result) {
      throw new ErrorResponse(UNPROCESSABLE_ENTITY, `Can't find make with id ${id}`);
    }

    return result;
  }

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
    return result;
  }

  @Put('/:id')
  public async updateMake(req: Request, res: Response): Promise<Make>
  {
    // validate uniqueness of name
    const nameExists = await this.makeRepo.findOne({ where: {
      name: req.body.name.toLowerCase(),
      id: Not(Equal(req.params.id))
    }});

    if (nameExists) {
      throw new ErrorResponse(BAD_REQUEST, `A make with the name '${req.body.name}' already exists`);
    }

    // update
    await this.makeRepo.createQueryBuilder()
      .update(Make)
      .set({ name: req.body.name.toLowerCase() })
      .where('id = :id', { id: req.body.id })
      .execute();

    // fetch and return updated
    const result = await this.makeRepo.findOne(req.body.id);
    if (!result) {
      throw new ErrorResponse(500, 'Unable to retrieve updated entity');
    }
    return result;
  }

  @Delete('/:id')
  public async deleteMake(req, resp)
  {

    const id: number = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new ErrorResponse(BAD_REQUEST, `Bad id param ${req.params.id}`);
    }

    const result = await this.makeRepo.createQueryBuilder()
      .delete()
      .from(Make)
      .where('id = :id', { id })
      .execute();

    if (!result || !result.affected) {
      throw new ErrorResponse(500, `Problem occurred attempting to delete make with id ${id}`);
    }

    return { success: true };

  }


}

export default MakeRouter;
