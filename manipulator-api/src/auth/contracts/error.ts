import { HttpStatus } from '@nestjs/common';
export const Errors = {
  AUTH_NOT_EXIST: {
    code: 'AUTH_NOT_EXIST',
    message: 'You does not config authentication for role',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  ROLE_NOT_EXIST: {
    code: 'ROLE_NOT_EXIST',
    message: `Please add role to route handler with decorator @Role('role_name')`,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: `Token is invalid with current role`,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
