import { HttpStatus } from '@nestjs/common';
export const Errors = {
  ACCOUNT_NOT_EXIST: {
    code: 'ACCOUNT_NOT_EXIST',
    message: 'The user is not found',
    status: HttpStatus.NOT_FOUND,
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    message: 'The password is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  ACCOUNT_IS_NOT_ACTIVE: {
    code: 'ACCOUNT_IS_NOT_ACTIVE',
    message: 'Your account is not active',
    status: HttpStatus.BAD_REQUEST,
  },
  EMAIL_EXIST: {
    code: 'EMAIL_EXIST',
    message: 'The email exists in system',
    status: HttpStatus.BAD_REQUEST,
  },
  EMAIL_NOT_EXIST: {
    code: 'EMAIL_NOT_EXIST',
    message: 'The email does not exist in the system',
    status: HttpStatus.BAD_REQUEST,
  },
  PHONE_EXIST: {
    code: 'PHONE_EXIST',
    message: 'The phone number has been registered.',
    status: HttpStatus.BAD_REQUEST,
  },
  PHONE_NOT_EXIST: {
    code: 'PHONE_NOT_EXIST',
    message: 'The phone number does not exist in the system.',
    status: HttpStatus.BAD_REQUEST,
  },
  SALON_NOT_EXIST: {
    code: 'SALON_NOT_EXIST',
    message: 'The salon is not exits',
    status: HttpStatus.NOT_FOUND,
  },
  EMAIL_OR_PHONE_EXIST: {
    code: 'EMAIL_OR_PHONE_EXIST',
    message: 'The email or the phone number exists in system.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_VERIFICATION_CODE: {
    code: 'INVALID_VERIFICATION_CODE',
    message: 'Your verification code is invalid.',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'The registration token is invalid or expired.',
    status: HttpStatus.BAD_REQUEST,
  },
  CANT_REGISTER_MANIPULATOR: {
    code: 'CANT_REGISTER_MANIPULATOR',
    message: 'Can not register new manipulator.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CANT_UPDATE_MANIPULATOR: {
    code: 'CANT_REGISTER_MANIPULATOR',
    message: 'Can not update the manipulator.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CANT_SEND_EMAIL: {
    code: 'CANT_SEND_EMAIL',
    message: 'Can not verify your email.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  SA_UNKNOWN_ERROR: {
    code: 'SA_UNKNOWN_ERROR',
    message: 'There is an unknown error from system admin',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CANT_CHANGE_EMAIL: {
    code: 'CANT_CHANGE_EMAIL',
    message: 'Can not change the email.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
