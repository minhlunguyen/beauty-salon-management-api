import { ApiProperty } from '@nestjs/swagger';
import { NationalLicense } from '@src/account/contracts/type';
import {
  MenuInfo,
  Photo,
  ReviewRating,
  SalonInfo,
  Symptom,
} from '@src/salon/contracts/value-object';

export class ManipulatorDetailForGuest {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty({ isArray: true, type: SalonInfo })
  salon: SalonInfo[];

  @ApiProperty({ isArray: true, type: Symptom })
  supportedSymptoms?: Symptom[];

  @ApiProperty()
  type: string;

  @ApiProperty()
  careerStart?: string;

  @ApiProperty({ isArray: true, type: String })
  nationalLicenses?: NationalLicense[];

  @ApiProperty()
  pr?: string;

  @ApiProperty()
  profile?: string;

  @ApiProperty({ isArray: true, type: Photo })
  photos?: Photo[];

  @ApiProperty()
  reviewRating?: ReviewRating;

  @ApiProperty({ isArray: true, type: MenuInfo })
  menus?: MenuInfo[];
}

export class ManipulatorDetailResponse {
  @ApiProperty({ type: ManipulatorDetailForGuest })
  data: ManipulatorDetailForGuest;
}
