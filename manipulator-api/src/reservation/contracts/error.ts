import { HttpStatus } from '@nestjs/common';

export const Errors = {
  INVALID_PAYMENT_ACCOUNT: {
    code: 'INVALID_PAYMENT_ACCOUNT',
    message: 'The payment method is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_MENU: {
    code: 'INVALID_MENU',
    message: 'The selected menu is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_MENU_DURATION: {
    code: 'INVALID_MENU_DURATION',
    message: 'The reservation times is difference from menu duration.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_RESERVATION_TIMES: {
    code: 'INVALID_RESERVATION_TIMES',
    message: 'The reservation times is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  CANT_SUBMIT_RESERVATION: {
    code: 'CANT_SUBMIT_RESERVATION',
    message: 'Can not submit the reservation',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CANT_COMPLETE_RESERVATION: {
    code: 'CANT_COMPLETE_RESERVATION',
    message: 'Can not complete the reservation',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  INVALID_RESERVATION_STATUS: {
    code: 'INVALID_RESERVATION_STATUS',
    message: 'The reservation status is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  RESERVATION_NOT_EXIST: {
    code: 'RESERVATION_NOT_EXIST',
    message: 'The reservation does not exist',
    status: HttpStatus.NOT_FOUND,
  },
  CAN_NOT_COMPLETE_BEFORE_DATE: {
    code: 'CAN_NOT_COMPLETE_BEFORE_DATE',
    message: 'The reservation cannot be completed before the reservation date.',
    status: HttpStatus.NOT_FOUND,
  },
  CAN_NOT_CANCEL: {
    code: 'CAN_NOT_CANCEL',
    message: 'The cancellation of reservations is not supported yet.',
    status: HttpStatus.NOT_FOUND,
  },
  INVALID_COUPON: {
    code: 'INVALID_COUPON',
    message: 'The coupon is unable to use.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_DISCOUNT_METHOD: {
    code: 'INVALID_DISCOUNT_METHOD',
    message: 'Can not use the coupon and ticket in the same reservation.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_TICKET: {
    code: 'INVALID_TICKET',
    message: 'The ticket is invalid.',
    status: HttpStatus.BAD_REQUEST,
  },
};
