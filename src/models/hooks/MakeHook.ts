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
    try {

      if (!event.entity.id || !event.entity.name) {
        throw new Error('Missing data for make. Can\'t update es documents');
      }

      await es.bulkUpdateField(event.entity.id, 'make', event.entity.name);
    }
    catch (e) {
      logger(e);
    }
  }

}
