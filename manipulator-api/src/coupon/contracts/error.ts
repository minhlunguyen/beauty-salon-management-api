import { HttpStatus } from '@nestjs/common';
export const Errors = {
  MENU_IS_INVALID: {
    code: 'MENU_IS_INVALID',
    message: 'The menu is invalid.',
    status: HttpStatus.BAD_REQUEST,
  },
  MENU_HAVE_NO_TICKET: {
    code: 'MENU_HAVE_NO_TICKET',
    message: 'The menu have no ticket.',
    status: HttpStatus.BAD_REQUEST,
  },
  DATA_IS_INVALID: {
    code: 'DATA_IS_INVALID',
    message: 'The data is invalid.',
    status: HttpStatus.BAD_REQUEST,
  },
  TICKET_NOT_FOUND: {
    code: 'TICKET_NOT_FOUND',
    message: 'The ticket was not found.',
    status: HttpStatus.BAD_REQUEST,
  },
  TICKET_IS_INVALID: {
    code: 'TICKET_IS_INVALID',
    message: 'The ticket is invalid.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_PAYMENT_ACCOUNT: {
    code: 'INVALID_PAYMENT_ACCOUNT',
    message: 'The payment method is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  CUSTOMER_CAN_NOT_BUY_TICKET: {
    code: 'CUSTOMER_CAN_NOT_BUY_TICKET',
    message: 'You can not buy ticket',
    status: HttpStatus.BAD_REQUEST,
  },
  CUSTOMER_BUY_TICKET_FAILED: {
    code: 'CUSTOMER_BUY_TICKET_FAILED',
    message: 'Buy ticket failed',
    status: HttpStatus.BAD_REQUEST,
  },
};
