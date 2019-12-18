import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import Model from '../Model';
import { container } from 'tsyringe';
import EsClient from '../../services/elasticsearch/EsClient';
import LoggerFactory from '../../services/LoggerFactory';

const logger = container.resolve(LoggerFactory).getLogger('app:hooks:model');
const es = container.resolve(EsClient);


@EventSubscriber()
export class ModelHook implements EntitySubscriberInterface<Model> {

  public listenTo() {
    return Model;
  }

  /*

    Called after Model has been updated.

  */
  public async afterUpdate(event: UpdateEvent<Model>) {

     logger(`AFTER UPDATE: `, event.entity);
     logger(event.updatedColumns.map(m => m.propertyName));

    // TODO batch update 'color'
    // to event.entity.name where 'color_id' = event.entity.id
  }

}
