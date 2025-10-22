import { ApiProperty } from '@nestjs/swagger';

export class ManipulatorsBySalonItemResponse {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  profile: string;
}

export class ManipulatorsBySalonResponse {
  @ApiProperty({ isArray: true, type: ManipulatorsBySalonItemResponse })
  docs: ManipulatorsBySalonItemResponse[];

  @ApiProperty()
  totalDocs: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}

export class ManipulatorsBySalonDataResponse {
  @ApiProperty({ type: ManipulatorsBySalonResponse })
  data: ManipulatorsBySalonResponse;
}
