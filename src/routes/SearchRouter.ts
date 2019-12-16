import { Controller, ClassWrapper, Get } from '@overnightjs/core';
import { BAD_REQUEST } from 'http-status-codes';
import { injectable } from 'tsyringe';
import { Request } from 'express';

import { DbService, PagedResponse } from '../services/DbService';
import Car from '../models/Car';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';


@injectable()
@Controller('search')
@ClassWrapper(harness)
export class SearchRouter {

  constructor(private db: DbService) { }

  @Get()
  public async searchCars(req: Request): Promise<PagedResponse<Car>>
  {
    // validate params
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);
    if (isNaN(limit)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for limit query param');
    }
    if (isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for offset query param');
    }

    const selectCount = 'SELECT COUNT(car.id) ';
    const selectModels = `
      SELECT car.id AS id,
        car.year,
        JSON_OBJECT('name', c.name, 'id', c.id) AS color,
        JSON_OBJECT(
              'name', model.name,
              'id', model.id,
              'make', JSON_OBJECT('id', make.id, 'name', make.name),
              'bodyStyle', JSON_OBJECT('id', bs.id, 'name', bs.name)
        ) AS model `;

    const q = `
      FROM cars AS car
        INNER JOIN models AS model ON car.model_id = model.id
        INNER JOIN makes AS make ON model.make_id = make.id
        INNER JOIN colors AS c ON car.color_id = c.id
        INNER JOIN body_styles AS bs ON model.body_style_id = bs.id
      WHERE make.name LIKE "%${(req.query.make || '').toLowerCase()}%"
        AND model.name LIKE "%${(req.query.model || '').toLowerCase()}%"
        AND c.name LIKE "%${(req.query.color || '').toLowerCase()}%"
        AND year LIKE "%${(req.query.year || '').toLowerCase()}%"
        AND bs.name LIKE "%${(req.query.bodyStyle || '').toLowerCase()}%"
      GROUP BY car.id
      ORDER BY car.id ASC
    `;

    const limits = `
      LIMIT ${limit || 100}
      OFFSET ${offset || 0};
    `;

    const count = await this.db.manager.query(selectCount + q);
    const results = await this.db.manager.query(selectModels + q + limits);

    return { total: count.length, results: results.map(r => {
        r.model = JSON.parse(r.model);
        r.color = JSON.parse(r.color);
        return r;
      })
    };
  }

}
