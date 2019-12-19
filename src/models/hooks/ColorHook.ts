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

    try {

      if (!event.entity.id || !event.entity.name) {
        throw new Error('Missing data for color. Can\'t update es documents');
      }

      await es.bulkUpdateField(event.entity.id, 'color', event.entity.name);
    }
    catch (e) {
      logger(e);
    }

  }

}
