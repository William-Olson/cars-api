import { Server } from '@overnightjs/core';
import { container, injectable } from 'tsyringe';
import { static as expressStatic } from 'express';
import * as swagger from 'swagger-express-ts';
import * as bodyParser from 'body-parser';

import LoggerFactory, { DebugFn } from './LoggerFactory';
import Routes from '../routes';
import ErrorResponse from '../routes/util/ErrorResponse';

/*

  ExpressServer

  Handles starting the express server, adding middleware, configuring swagger,
  initializing router classes, and setting up error handling.

*/
@injectable()
export class ExpressServer extends Server {

  private logger: DebugFn;

  constructor(loggerFactory: LoggerFactory)
  {
    super();
    this.logger = loggerFactory.getLogger('app:server');

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.use('/api-docs/swagger' , expressStatic('build/swagger'));
    this.app.use('/api-docs/swagger/assets' , expressStatic('node_modules/swagger-ui-dist'));
    this.app.use(swagger.express({
      definition : {
        info : {
          title : 'Cars API' ,
          version : '1.0.0'
        } ,
        externalDocs : {
          url : 'https://github.com/William-Olson/cars-api/blob/master/API.md'
        }
      }
    }));

    for (const route of Routes.asArray()) {
      const routeInstance = container.resolve(route);
      super.addControllers(routeInstance);
    }

    this.addErrorHandlers();
  }

  public start(port: number): void
  {
    this.app.listen(port, () => {
      this.logger(`Server is now listening on port: ${port}`);
    });
  }

  private addErrorHandlers()
  {
    this.app.use((req, res, next) => {
      next(new ErrorResponse(404, 'Not Found'));
    });

    this.app.use((err, req, res, next) => {
      const statusCode = err.statusCode || 500;

      // only allow message for 4XX errors, otherwise default to basic message
      let message = err.message || 'Internal Server Error';
      message = `${statusCode}`[0] === '4' ? message : 'Internal Server Error';

      res.status(statusCode);
      res.send({ status: statusCode, message });
    });
  }

}

export default ExpressServer;
