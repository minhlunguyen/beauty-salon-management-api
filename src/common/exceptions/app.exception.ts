import { HttpStatus } from '@nestjs/common';
export class AppException extends Error {
  public code;
  public httpStatus;
  public data;
  constructor(
    code: string,
    message: string,
    httpStatus: number = HttpStatus.INTERNAL_SERVER_ERROR,
    data: Record<string, any> = {},
  ) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.data = data;
  }
}
