import { ApiProperty } from '@nestjs/swagger';
import {
  Address,
  BankInfo,
  BusinessHour,
  Feature,
  Photo,
} from '@src/salon/contracts/value-object';

export class GetSalonByOperatorOutput {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  lastLogin?: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  postalCode?: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  pr: string;

  @ApiProperty({ isArray: true, type: Address })
  addresses?: Address[];

  @ApiProperty({ isArray: true, type: String })
  access?: string[];

  @ApiProperty({ isArray: true, type: Feature })
  features?: Feature[];

  @ApiProperty({ isArray: true, type: Photo })
  photos?: Photo[];

  @ApiProperty({ type: BankInfo })
  bankInfo?: BankInfo;

  @ApiProperty({ isArray: true, type: BusinessHour })
  businessHours?: BusinessHour[];
}
