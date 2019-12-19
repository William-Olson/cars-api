import { Controller, ClassWrapper, Get } from '@overnightjs/core';
import { BAD_REQUEST } from 'http-status-codes';
import { injectable } from 'tsyringe';
import { Request } from 'express';

import { DbService, PagedResponse } from '../services/DbService';
import Car from '../models/Car';
import harness from './util/harness';
import ErrorResponse from './util/ErrorResponse';
import { ApiPath, ApiOperationGet, SwaggerDefinitionConstant } from 'swagger-express-ts';
import { PagedCars } from './util/swagger-models/PagedResponses';
import EsClient from '../services/elasticsearch/EsClient';

@ApiPath({
  path: '/search',
  name: 'Search'
})
@injectable()
@Controller('search')
@ClassWrapper(harness)
export class SearchRouter {

  constructor(private db: DbService, private es: EsClient) { }

  @ApiOperationGet({
    description: 'Search Cars by a single term via Elasticsearch. Results are sorted by relevance.',
    summary: 'Search Cars By Term (ES)',
    path: '/es/term',
    parameters: {
      query: {
        q: { name: 'q', description: 'Search text', required: false },
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedCars.name },
        400: { description: 'Bad Parameters' }
    }
  })
  @Get('es/term')
  public async searchCarsByTermEs(req: Request): Promise<PagedResponse<Car>>
  {
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);
    if (isNaN(limit)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for limit query param');
    }
    if (isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for offset query param');
    }

    const term = (req.query.q || '').toLowerCase().trim();

    if (!term) {
      return await this.es.matchAll(offset, limit);
    }

    return await this.es.searchCarsByTerm(term, offset, limit);
  }

  @ApiOperationGet({
    description: 'Search Cars by attributes via Elasticsearch. More of a forgiving style of search. Should yield more results compared to the /search endpoint. Sorted by relevance.',
    summary: 'Search Cars By Attributes (ES)',
    path: '/es',
    parameters: {
      query: {
        make: { name: 'make', description: 'Search text for make', required: false },
        model: { name: 'model', description: 'Search text for model', required: false },
        color: { name: 'color', description: 'Search text for color', required: false },
        year: { name: 'year', description: 'Search text for year', required: false },
        bodyStyle: { name: 'bodyStyle', description: 'Search text for bodyStyle', required: false },
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedCars.name },
        400: { description: 'Bad Parameters' }
    }
  })
  @Get('es')
  public async searchCarsEs(req: Request): Promise<PagedResponse<Car>>
  {
    const limit: number = parseInt(req.query.limit || '100', 10);
    const offset: number = parseInt(req.query.offset || '0', 10);
    if (isNaN(limit)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for limit query param');
    }
    if (isNaN(offset)) {
      throw new ErrorResponse(BAD_REQUEST, 'Bad input for offset query param');
    }

    const searchFields = {
      make: (req.query.make || '').toLowerCase().trim(),
      model: (req.query.model || '').toLowerCase().trim(),
      color: (req.query.color || '').toLowerCase().trim(),
      year: (req.query.year || '').toLowerCase().trim(),
      bodyStyle: (req.query.bodyStyle || '').toLowerCase().trim()
    };

    return await this.es.searchCars(searchFields, offset, limit);
  }

  @ApiOperationGet({
    description: 'Search Cars by their attributes. Good for filtering or faceted searching.',
    summary: 'Search Cars by Attributes',
    parameters: {
      query: {
        make: { name: 'make', description: 'Search text for make', required: false },
        model: { name: 'model', description: 'Search text for model', required: false },
        color: { name: 'color', description: 'Search text for color', required: false },
        year: { name: 'year', description: 'Search text for year', required: false },
        bodyStyle: { name: 'bodyStyle', description: 'Search text for bodyStyle', required: false },
        limit: { name: 'limit', description: 'max results to retrieve', required: false },
        offset: { name: 'offset', description: 'offset of first result index', required: false }
      }
    },
    responses: {
        200: { description: 'Success', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: PagedCars.name },
        400: { description: 'Bad Parameters' }
    }
  })
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
      WHERE make.name LIKE "%" ? "%"
        AND model.name LIKE "%" ? "%"
        AND c.name LIKE "%" ? "%"
        AND year LIKE "%" ? "%"
        AND bs.name LIKE "%" ? "%"
      GROUP BY car.id
      ORDER BY car.id ASC
    `;

    const bindings = [
      (req.query.make || '').toLowerCase().trim(),
      (req.query.model || '').toLowerCase().trim(),
      (req.query.color || '').toLowerCase().trim(),
      (req.query.year || '').toLowerCase().trim(),
      (req.query.bodyStyle || '').toLowerCase().trim()
    ];

    const limits = `
      LIMIT ${limit || 100}
      OFFSET ${offset || 0};
    `;

    const count = await this.db.manager.query(selectCount + q, bindings);
    const results = await this.db.manager.query(selectModels + q + limits, bindings);

    return { total: count.length, results: results.map(r => {
        r.model = JSON.parse(r.model);
        r.color = JSON.parse(r.color);
        return r;
      })
    };
  }

}
