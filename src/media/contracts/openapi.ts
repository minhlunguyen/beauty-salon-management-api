import { ApiProperty } from '@nestjs/swagger';

export class SignedUrlData {
  @ApiProperty()
  url: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  contentType: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  originalName: string;
}

export class SignedUrlItems {
  @ApiProperty({ isArray: true, type: SignedUrlData })
  result: SignedUrlData[];
}

export class SignedUrlItemsResponse {
  @ApiProperty({ type: SignedUrlItems })
  data: SignedUrlItems;
}
