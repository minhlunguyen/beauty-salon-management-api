import { HttpStatus } from '@nestjs/common';
export const Errors = {
  TIME_CHANGE_INVALID: {
    code: 'TIME_CHANGE_INVALID',
    message: 'The changed times conflict with reservation times.',
    status: HttpStatus.BAD_REQUEST,
  },
};
