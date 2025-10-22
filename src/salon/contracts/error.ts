import { HttpStatus } from '@nestjs/common';
export const Errors = {
  CAN_NOT_REGISTER_SALON: {
    code: 'CAN_NOT_REGISTER_SALON',
    message: 'Can not register a new salon',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  CAN_NOT_UPDATE_SALON: {
    code: 'CAN_NOT_UPDATE_SALON',
    message: 'Can not update the salon',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: "You don't have permission on this action",
    status: HttpStatus.FORBIDDEN,
  },
  INVALID_SALON_OWNER: {
    code: 'INVALID_SALON_OWNER',
    message: 'You are not the salon owner',
    status: HttpStatus.BAD_REQUEST,
  },
  CAN_NOT_CREATE_MENU: {
    code: 'CAN_NOT_CREATE_MENU',
    message: 'You can not create menu',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_MANIPULATOR: {
    code: 'INVALID_MANIPULATOR',
    message: 'Manipulator is invalid',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_DATA: {
    code: 'INVALID_DATA',
    message: 'Invalid data',
    status: HttpStatus.BAD_REQUEST,
  },
  INVALID_MENU: {
    code: 'INVALID_MENU',
    message: 'Invalid menu',
    status: HttpStatus.BAD_REQUEST,
  },
  CAN_NOT_UPDATE_MENU: {
    code: 'CAN_NOT_UPDATE_MENU',
    message: 'You can not update menu',
    status: HttpStatus.BAD_REQUEST,
  },
  SALON_NOT_FOUND: {
    code: 'SALON_NOT_FOUND',
    message: 'The salon does not found.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  BANK_NOT_FOUND: {
    code: 'BANK_NOT_FOUND',
    message: 'The bank does not found.',
    status: HttpStatus.BAD_REQUEST,
  },
  BANK_BRANCH_NOT_FOUND: {
    code: 'BANK_BRANCH_NOT_FOUND',
    message: 'The bank branch does not found.',
    status: HttpStatus.BAD_REQUEST,
  },
  SALON_HAS_NO_OWNER: {
    code: 'SALON_HAS_NO_OWNER',
    message: 'The salon has no owner manipulator.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  INVALID_CREATE_MENU_WITH_TICKET: {
    code: 'INVALID_CREATE_MENU_WITH_TICKET',
    message: 'You have to input menu type is ticket and ticket data together.',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
};
