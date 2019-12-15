import { createConnection, Connection, Repository, FindManyOptions, EntityManager } from 'typeorm';
import LoggerFactory, { DebugFn } from './LoggerFactory';
import { injectable, singleton } from 'tsyringe';
import * as retry from 'async-retry';

/*

  PagedResponse

  Structure for representing the result of a paged query.

*/
export interface PagedResponse<T> {
  total: number;
  results: T[];
}

/*

  DbService

  Handles connecting to the database and provides helper methods
  for interacting with the database.

*/
@singleton()
@injectable()
export class DbService {

  private dbConnection!: Connection;
  private logger: DebugFn;

  constructor(loggerFactory: LoggerFactory)
  {

    this.logger = loggerFactory.getLogger('app:db');

  }

  public async connect(): Promise<void>
  {
    let attempt = 0;
    const task = async () => {
      this.logger(`db connection attempt ${++attempt}`);
      this.dbConnection = await createConnection();
    };
    await retry(task, { retries: 15, factor: 1.5 });
    this.logger('db connected successfully!');
  }

  public repo<T>(entityType: new () => T): Repository<T>
  {
    return this.dbConnection.getRepository(entityType);
  }

  public get connection(): Connection
  {
    return this.dbConnection;
  }

  public get manager(): EntityManager
  {
    return (this.dbConnection || { }).manager;
  }

  public async pagedQuery<T>(entityType: new () => T, params: FindManyOptions<T>): Promise<PagedResponse<T>>
  {

    const repo = this.repo(entityType);

    const [ rows, total ] = await repo.findAndCount(params);
    return {
      results: rows || [ ],
      total: total || 0
    };

  }

}

