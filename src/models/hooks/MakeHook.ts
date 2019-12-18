import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import Make from '../Make';
import { container } from 'tsyringe';
import EsClient from '../../services/elasticsearch/EsClient';
import LoggerFactory from '../../services/LoggerFactory';

const logger = container.resolve(LoggerFactory).getLogger('app:hooks:make');
const es = container.resolve(EsClient);


@EventSubscriber()
export class MakeHook implements EntitySubscriberInterface<Make> {

  public listenTo() {
    return Make;
  }

  /*

    Called after Make has been updated.

  */
  public async afterUpdate(event: UpdateEvent<Make>) {

     logger(`AFTER UPDATE: `, event.entity);
     logger(event.updatedColumns.map(m => m.propertyName));

    // TODO batch update 'color'
    // to event.entity.name where 'color_id' = event.entity.id
  }

}
