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

     logger(`AFTER UPDATE: `, event.entity);
     logger(event.updatedColumns.map(m => m.propertyName));

    // TODO batch update 'body_style'
    // to event.entity.name where 'body_style_id' = event.entity.id
  }

}
