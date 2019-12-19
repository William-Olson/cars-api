import { injectable, singleton } from 'tsyringe';
import ConfigService from '../ConfigService';
import * as elasticsearch from '@elastic/elasticsearch';
import LoggerFactory from '../LoggerFactory';
import * as retry from 'async-retry';
import { elasticSearchSettings, elasticSearchMappings } from './esSettings';
import Car from '../../models/Car';
import Model from '../../models/Model';
import BodyStyle from '../../models/BodyStyle';
import Make from '../../models/Make';
import Color from '../../models/Color';
import { PagedResponse } from '../DbService';

/*

  Input text fields for performing car queries on Elasticsearch

*/
export interface CarSearchTerms {
  year?: number;
  make?: string;
  model?: string;
  color?: string;
  bodyStyle?: string;
}

interface ShouldQuery {
  query: {
    bool: {
      should: any[ ];
    };
  };
}

/*

  EsClient

  Service for interacting with Elasticsearch

*/
@singleton()
@injectable()
export default class EsClient {

  private static INDEX: string = 'cars';

  private esClient: elasticsearch.Client;
  private logger;

  constructor(config: ConfigService, loggerFactory: LoggerFactory)
  {

    this.esClient = new elasticsearch.Client({ node: config.getEnv('ES_URL') });
    this.logger = loggerFactory.getLogger('app:es');

  }

  /*

    Creates the index if it doesn't exist. Configures analyzer/filter
    settings and updates mappings while creating the index.

  */
  public async initIndex()
  {
    const { body: exists } = await this.esClient.indices.exists({ index: EsClient.INDEX });
    if (exists === true) {
      this.logger(`Index '${EsClient.INDEX}' already exists. Skipping creation`);
      return;
    }

    try {
      await this.esClient.indices.create({
        index: EsClient.INDEX,
        body: {
          settings: elasticSearchSettings,
          mappings: elasticSearchMappings
        }
      });
      this.logger(`Successfully created index '${EsClient.INDEX}'`);
    }
    catch (e) {
      this.logger(e.meta.body.error);
    }
  }

  /*

    Ensures successful connection to Elasticsearch. Pings
    Elasticsearch until a successful pong is received or
    timeout/max-retries reached. Throws if no pong is ever
    received.

  */
  public async connect()
  {
    let attempt = 0;
    const task = async () => {
      this.logger(`elasticsearch connection attempt: ${++attempt}`);
      const res: elasticsearch.ApiResponse = await this.esClient.ping();
      if (res.statusCode !== 200) {
        throw new Error('failed to connect to elasticsearch');
      }
    };
    const factor = 3.5;
    const retries = 15;

    await retry(task, { factor, retries });
    this.logger('elasticsearch connected successfully');
  }

  /*

    Indexes a document to Elasticsearch

  */
  public async index(document)
  {

    if (!document || !document.id) {
      throw new Error('Malformed document parameter');
    }

    this.logger(`Indexing document ${document.id} to index ${EsClient.INDEX}`);

    return await this.esClient.index({
      id: document.id,
      index: EsClient.INDEX,
      type: 'default',
      body: document
    });

  }

  /*

    Update an Elasticsearch document

  */
  public async update(document)
  {

    if (!document || !document.id) {
      throw new Error('Malformed document parameter');
    }

    this.logger(`Updating indexed document ${document.id} in index ${EsClient.INDEX}`);

    return await this.esClient.update({
      id: document.id,
      index: EsClient.INDEX,
      type: 'default',
      body: { doc: document }
    });

  }

  /*

    Update many documents at once via a query

  */
  public async bulkUpdateField(id: number, field: string, value: string)
  {

    this.logger(`bulk updating '${field}' field to '${value}' for documents with ${field}_id = ${id}`);
    const body = {
      script : {
          source: `ctx._source.${field} = params.value`,
          lang: 'painless',
          params: { value }
      },
      query: {
        term: {
          [`${field}_id`]: id
        }
      }
    };

    await this.esClient.updateByQuery({ index: EsClient.INDEX, type: 'default', body });
  }

  /*

    Update elastic search docs based on model changes

  */
  public async updateByModelData(model: Model) {

    this.logger(`bulk updating 'model' data for documents with model_id = ${model.id}`);
    const body = {
      script : {
          source: `
            ctx._source.model = params.modelValue;
            ctx._source.make = params.makeValue;
            ctx._source.body_style = params.bodyValue;
            ctx._source.body_style_id = params.bodyId;
            ctx._source.make_id = params.makeId;
          `,
          lang: 'painless',
          params: {
            modelValue: model.name,
            bodyValue: (model.bodyStyle || { }).name,
            makeValue: (model.make || { }).name,
            bodyId: (model.bodyStyle || { }).id,
            makeId: (model.make || { }).id,
          }
      },
      query: {
        term: {
          model_id: model.id
        }
      }
    };

    await this.esClient.updateByQuery({ index: EsClient.INDEX, type: 'default', body });
  }

  /*

    Perform a query on Elasticsearch for cars where a single search term matches any field

  */
  public async searchCarsByTerm(term: string, offset?: number, limit?: number): Promise<PagedResponse<Car>>
  {
    offset = offset || 0;
    limit = limit || 100;

    const searchParams = {
      index: EsClient.INDEX,
      from: offset,
      size: limit,
      body: {
        query: {
          multi_match: {
            query: term,
            fields: [ 'year', 'make', 'model', 'color', 'body_style' ]
          }
        }
      }
    };

    try {
      const { body: res } = await this.esClient.search(searchParams);
      const cars = this.convertHitsToModels(res.hits.hits);

      return {
        total: res.hits.total || 0,
        results: cars,
      };
    }
    catch (e) {
      this.logger('Elasticsearch Error :: ', e.body);
      return { results: [ ], total: 0 };
    }
  }

  /*

    Perform a query on Elasticsearch for cars matching specific car fields

  */
  public async searchCars(fields: CarSearchTerms, offset?: number, limit?: number): Promise<PagedResponse<Car>>
  {

    offset = offset || 0;
    limit = limit || 100;

    const body: ShouldQuery = {
      query: {
        bool: { should: [ ] }
      }
    };

    if (fields.year) {
      body.query.bool.should.push({ match: { year: fields.year } });
    }

    if (fields.bodyStyle) {
      body.query.bool.should.push({ match: { body_style: fields.bodyStyle } });
    }

    if (fields.color) {
      body.query.bool.should.push({ match: { color: fields.color } });
    }

    if (fields.make) {
      body.query.bool.should.push({ match: { make: fields.make } });
    }

    if (fields.model) {
      body.query.bool.should.push({ match: { model: fields.model } });
    }

    const searchParams = {
      index: EsClient.INDEX,
      from: offset,
      size: limit,
      body
    };

    try {
      const { body: res } = await this.esClient.search(searchParams);
      const cars = this.convertHitsToModels(res.hits.hits);

      return {
        total: res.hits.total || 0,
        results: cars,
      };
    }
    catch (e) {
      this.logger('Elasticsearch Error :: ', e.body);
      return { results: [ ], total: 0 };
    }

  }

  /*

    Reformat an array of elasticsearch hits to a Car array

  */
  private convertHitsToModels(hits): Car[] {
    return hits.map(h => {
      const car = new Car();
      const model = new Model();
      const body = new BodyStyle();
      const make = new Make();
      const color = new Color();

      color.id = h._source.color_id;
      make.id = h._source.make_id;
      body.id = h._source.body_style_id;
      model.id = h._source.model_id;
      car.id = h._source.id;
      car.year = h._source.year;

      color.name = h._source.color;
      make.name = h._source.make;
      body.name = h._source.body_style;
      model.name = h._source.model;

      model.make = make;
      model.bodyStyle = body;
      car.color = color;
      car.model = model;

      return car;
    });
  }

}
