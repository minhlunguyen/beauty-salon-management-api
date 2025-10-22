import { HttpStatus } from '@nestjs/common';
export const Errors = {
  THE_CARD_IN_RESERVED: {
    code: 'THE_CARD_IN_RESERVED',
    message: 'The card is used for the reservations',
    status: HttpStatus.BAD_REQUEST,
  },
};
