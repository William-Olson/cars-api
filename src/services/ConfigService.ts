import { singleton } from 'tsyringe';

/*

  ProcessEnv

  Represents node.js' process.env as a typed interface

*/
export interface ProcessEnv {
  [key: string]: string | undefined;
}

/*

  ConfigService

  Provides fetching of environment variables.

*/
@singleton()
class ConfigService {

  /*

    Get an environment variable by name

  */
  public getEnv(variableName: string): string | undefined
  {

    return this.getEnvironment()[variableName];

  }

  /*

    Get process.env
    Note: access props via bracket notation
      i.e. env['name']

  */
  public getEnvironment(): ProcessEnv
  {
    return process.env;
  }

}


export default ConfigService;
