import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import BodyStyle from '../BodyStyle';
import { container } from 'tsyringe';
import EsClient from '../../services/elasticsearch/EsClient';
import LoggerFactory from '../../services/LoggerFactory';

const logger = container.resolve(LoggerFactory).getLogger('app:hooks:body-style');
const es = container.resolve(EsClient);


@EventSubscriber()
export class BodyStyleHook implements EntitySubscriberInterface<BodyStyle> {

  public listenTo() {
      return BodyStyle;
  }


  /*

    Called after BodyStyle has been updated.

  */
  public async afterUpdate(event: UpdateEvent<BodyStyle>) {
    try {

      if (!event.entity.id || !event.entity.name) {
        throw new Error('Missing data for bodyStyle. Can\'t update es documents');
      }

      await es.bulkUpdateField(event.entity.id, 'body_style', event.entity.name);
    }
    catch (e) {
      logger(e);
    }
  }

}
