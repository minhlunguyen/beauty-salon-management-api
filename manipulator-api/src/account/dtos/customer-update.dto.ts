import { OmitType } from '@nestjs/swagger';
import { CustomerRegisterDto } from './customer-register.dto';

export class CustomerUpdateDto extends OmitType(CustomerRegisterDto, [
  'email',
  'phone',
  'token',
] as const) {}
