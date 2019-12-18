import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import Car from '../Car';
import { container } from 'tsyringe';
import EsClient from '../../services/elasticsearch/EsClient';
import LoggerFactory from '../../services/LoggerFactory';
import { DbService } from '../../services/DbService';

const logger = container.resolve(LoggerFactory).getLogger('app:hooks:car');
const es = container.resolve(EsClient);
const db = container.resolve(DbService);


@EventSubscriber()
export class CarHook implements EntitySubscriberInterface<Car> {

  public listenTo() {
    return Car;
  }

  /*

    Called after Car insertion.

  */
  public async afterInsert(event: InsertEvent<Car>) {
    // flatten model for indexing
    const flat = await this.inflatePartialModelAndFlatten(event.entity);

    if (!flat) {
      throw new Error(`Unable to index car with id ${event.entity.id}`);
    }

    logger('indexing car . . .');

    // index
    await es.index(flat);
  }

  /*

    Called after Car has been updated.

  */
  public async afterUpdate(event: UpdateEvent<Car>) {

     logger(`AFTER UPDATE: `, event.entity);
     logger(event.updatedColumns.map(m => m.propertyName));

    // TODO batch update 'color'
    // to event.entity.name where 'color_id' = event.entity.id
  }

  /*

    Retrieves detached relations from the db and returns the car model
    in a flat format suitable for indexing to elasticsearch

  */
  private async inflatePartialModelAndFlatten(partialModel: Car)
  {
    const model = partialModel.model || { };
    const color = partialModel.color || { };

    // get detached relational data
    const detached = await db.manager.query(`
      SELECT make.name as make,
        bs.name as body_style,
        make.id as make_id,
        bs.id as body_style_id
      FROM models as model
        INNER JOIN makes AS make ON model.make_id = make.id
        INNER JOIN body_styles AS bs ON model.body_style_id = bs.id
      WHERE model.id = ?
      LIMIT 1
    `, [ model.id ]);

    if (!detached || !detached.length) {
      logger(`Error fetching relations for car with id ${partialModel.id}.`);
      return;
    }

    return {
      id: partialModel.id,
      year: partialModel.year,
      model: model.name,
      color: color.name,
      color_id: color.id,
      model_id: model.id,
      make: detached[0].make,
      body_style: detached[0].body_style,
      make_id: detached[0].make_id,
      body_style_id: detached[0].body_style_id
    };

  }

}
