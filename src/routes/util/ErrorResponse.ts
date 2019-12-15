/*

  ErrorResponse

  Custom Error that holds a statusCode property.

*/
export default class ErrorResponse extends Error {

  public static from(e?: Error): ErrorResponse {
    if (!e) {
      return new ErrorResponse();
    }

    return new ErrorResponse(500, e.message);
  }

  public statusCode: number = 500;

  constructor(statusCode?: number, message?: string)
  {
    super();

    this.name = 'ErrorResponse';
    this.stack = (new Error()).stack;
    this.statusCode = statusCode || 500;
    this.message = message || 'Internal Server Error';

  }

}
