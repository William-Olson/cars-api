import 'reflect-metadata';
import LoggerFactory from './services/LoggerFactory';
import ConfigService from './services/ConfigService';
import { container } from 'tsyringe';

import ExpressServer from './services/ExpressServer';
import { DbService } from './services/DbService';
import EsClient from './services/elasticsearch/EsClient';

const logger = container.resolve(LoggerFactory).getLogger('app:startup');
const config = container.resolve(ConfigService);

// async boot
(async () => {

  logger('Starting Application . . .');

  try {
    logger('Connecting to Database . . .');
    const db: DbService = container.resolve(DbService);
    await db.connect();

    logger('Connecting to Elasticsearch . . .');
    const es: EsClient = container.resolve(EsClient);
    await es.connect();
    await es.initIndex();

    logger('Starting Server . . .');
    const port = parseInt(config.getEnv('PORT') || '3000', 10);
    const server: ExpressServer = container.resolve(ExpressServer);
    server.start(port);
  }
  catch (e) {
    logger('App startup failed: ', e);
    process.exit(-1);
  }

})();
