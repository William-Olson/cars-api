import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import Color from '../Color';
import { container } from 'tsyringe';
import EsClient from '../../services/elasticsearch/EsClient';
import LoggerFactory from '../../services/LoggerFactory';

const logger = container.resolve(LoggerFactory).getLogger('app:hooks:color');
const es = container.resolve(EsClient);


@EventSubscriber()
export class ColorHook implements EntitySubscriberInterface<Color> {

  public listenTo() {
    return Color;
  }

  /*

    Called after Color has been updated.

  */
  public async afterUpdate(event: UpdateEvent<Color>) {

     logger(`AFTER UPDATE: `, event.entity);
     logger(event.updatedColumns.map(m => m.propertyName));

    // TODO batch update 'color'
    // to event.entity.name where 'color_id' = event.entity.id
  }

}
