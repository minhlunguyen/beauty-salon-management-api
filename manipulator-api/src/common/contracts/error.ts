import { HttpStatus } from '@nestjs/common';
export const Errors = {
  OBJECT_NOT_FOUND: {
    code: 'OBJECT_NOT_FOUND',
    message: 'Object not found',
    status: HttpStatus.NOT_FOUND,
  },
  EMAIL_EXIST: {
    code: 'EMAIL_EXIST',
    message: 'This email address is already registered.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Token is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  EXPIRED_TOKEN: {
    code: 'EXPIRED_TOKEN',
    message: 'Token is expired',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_PHONE_NUMBER: {
    code: 'INVALID_PHONE_NUMBER',
    message: 'Your phone number is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  VERIFICATION_CODE_NOT_FOUND: {
    code: 'VERIFICATION_CODE_NOT_FOUND',
    message: 'Your verification code is not found',
    status: HttpStatus.NOT_FOUND,
  },
  CAN_NOT_VERIFY_CODE: {
    code: 'CAN_NOT_VERIFY_CODE',
    message: 'Can not verify the verification code',
    status: HttpStatus.BAD_REQUEST,
  },
  CAN_NOT_SEND_VERIFICATION_CODE: {
    code: 'CAN_NOT_SEND_VERIFICATION_CODE',
    message: 'Can not send the verification code',
    status: HttpStatus.BAD_REQUEST,
  },
  STATION_NOT_EXIST: {
    code: 'STATION_NOT_EXIST',
    message: 'Station not found',
    status: HttpStatus.NOT_FOUND,
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'Permission denied.',
    status: HttpStatus.FORBIDDEN,
  },
};
