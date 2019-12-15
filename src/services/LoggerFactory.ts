import * as debugLogger from 'debug';
import { singleton } from 'tsyringe';

// the debug function interface type
export type DebugFn = (...args) => void;

/*

  LoggerFactory

  Factory class for creating debug loggers.

*/
@singleton()
export class LoggerFactory {

  public getLogger(name: string): DebugFn {
    const logger: WrappedLogger = new WrappedLogger(name);
    logger.log = logger.log.bind(logger);
    return logger.log;
  }

}

/*

  WrappedLogger

  Represents a wrapped debug logger. Centralizes
  all calls to log something to one location.

*/
class WrappedLogger {

  private debug: any;

  constructor(loggerScopeName: string) {
    this.debug = debugLogger(loggerScopeName);
  }

  /*

    The wrapper for all debug logging

  */
  public log(...args) {
    this.debug(...args);
  }

}


export default LoggerFactory;
