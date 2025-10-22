import { ApiProperty } from '@nestjs/swagger';

export enum genders {
  NULL = 0,
  MALE = 1,
  FEMALE = 2,
}

export type NationalLicense =
  | 'Physical Therapist'
  | 'Occupational Therapist'
  | 'Massage Therapist'
  | 'Chiropractor';

export class AuthToken {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  deviceId?: string;
}
