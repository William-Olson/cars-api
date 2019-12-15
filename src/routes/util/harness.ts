import { Request, Response, NextFunction, RequestHandler } from 'express';

import { container } from 'tsyringe';
import LoggerFactory from '../../services/LoggerFactory';
import ErrorResponse from './ErrorResponse';

const logger = container.resolve(LoggerFactory).getLogger('app:route-harness');

/*

  Wrapper Function for router class methods

  Router class methods are all wrapped in a try/catch block
  when using this wrapper. Also Router class methods can return
  a value to send as a response instead of handling the sending
  within the method itself.

*/
export const harness = (fn: RequestHandler) => {

  return async (req: Request, resp: Response, next: NextFunction) => {
    logger(`${req.method}: '${req.originalUrl}'`);

    try {
      const result = await fn(req, resp, next);
      if (result) {
        resp.send(result);
      }
    }
    catch (e) {

      if (!e || !e.statusCode) {
        e = ErrorResponse.from(e);
      }

      logger('Error:', `[${e.statusCode}]`, e.message);

      next(e);
    }
  };

};

export default harness;
