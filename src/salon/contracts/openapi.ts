import { ApiProperty } from '@nestjs/swagger';
import { Symptom } from '../schemas/symptom.schema';
import { Province } from '../schemas/province.schema';
import { Feature } from '../schemas/feature.schema';
import { Station } from '../schemas/station.schema';
import { Area } from '../schemas/area.schema';
import { Bank } from '../schemas/bank.schema';
import { BankBranch } from '../schemas/bank-branch.schema';
import { Line } from '../schemas/line.schema';
import { Address, BankInfo, BusinessHour, Photo } from './value-object';

export class SymptomItems {
  @ApiProperty({ isArray: true, type: Symptom })
  result: Symptom[];
}

export class SymptomItemsResponse {
  @ApiProperty({ type: SymptomItems })
  data: SymptomItems;
}

export class ProvinceItems {
  @ApiProperty({ isArray: true, type: Province })
  result: Province[];
}

export class ProvinceItemsResponse {
  @ApiProperty({ type: ProvinceItems })
  data: ProvinceItems;
}

export class LineItems {
  @ApiProperty({ isArray: true, type: Line })
  result: Line[];
}

export class LineItemsResponse {
  @ApiProperty({ type: LineItems })
  data: LineItems;
}

export class StationItems {
  @ApiProperty({ isArray: true, type: Station })
  result: Station[];
}

export class StationItemsResponse {
  @ApiProperty({ type: StationItems })
  data: StationItems;
}

export class AreaItems {
  @ApiProperty({ isArray: true, type: Area })
  result: Area[];
}

export class AreaItemsResponse {
  @ApiProperty({ type: AreaItems })
  data: AreaItems;
}

export class FeatureItems {
  @ApiProperty({ isArray: true, type: Feature })
  result: Feature[];
}

export class FeatureItemsResponse {
  @ApiProperty({ type: FeatureItems })
  data: FeatureItems;
}

export class AllData {
  @ApiProperty({ isArray: true, type: Feature })
  features: Feature[];

  @ApiProperty({ isArray: true, type: Province })
  provinces: Province[];

  @ApiProperty({ isArray: true, type: Symptom })
  symptoms: Symptom[];
}

export class AllDataResponse {
  @ApiProperty({ type: AllData })
  data: AllData;
}

export class BankItems {
  @ApiProperty({ isArray: true, type: Bank })
  result: Bank[];
}

export class BankItemsResponse {
  @ApiProperty({ type: BankItems })
  data: BankItems;
}

export class BankBranchItems {
  @ApiProperty({ isArray: true, type: BankBranch })
  result: BankBranch[];
}

export class BankBranchItemsResponse {
  @ApiProperty({ type: BankBranchItems })
  data: BankBranchItems;
}

export class SalonItem {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  zipcode?: string;

  @ApiProperty({ isArray: true, type: Address })
  addresses?: Address[];

  @ApiProperty({ isArray: true, type: String })
  access?: string[];

  @ApiProperty({ isArray: true, type: Feature })
  features?: Feature[];

  @ApiProperty({ isArray: true, type: Photo })
  photos?: Photo[];

  @ApiProperty()
  note?: string;

  @ApiProperty({ type: BankInfo })
  bankInfo?: BankInfo;

  @ApiProperty({ isArray: true, type: BusinessHour })
  businessHours?: BusinessHour[];

  @ApiProperty()
  isPublished?: boolean;
}

export class SalonItemReponse {
  @ApiProperty({ type: SalonItem })
  data: SalonItem;
}
