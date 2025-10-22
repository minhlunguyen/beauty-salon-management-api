import { ApiProperty } from '@nestjs/swagger';

export class TreatmentFile {
  @ApiProperty()
  name: string;

  @ApiProperty()
  objectKey: string;

  @ApiProperty()
  fileUrl?: string;
}

export class TreatmentInfo {
  @ApiProperty()
  treatmentId?: string;

  @ApiProperty()
  treatmentInfo: string;

  @ApiProperty()
  treatmentFile: TreatmentFile;
}
