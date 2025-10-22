import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TreatmentFileDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  objectKey: string;
}

export class CompleteReservationDto {
  @ApiProperty()
  @IsNotEmpty()
  menuId: string;

  @ApiProperty({ type: Number })
  @Min(0)
  amount: number;

  @ApiProperty({ type: TreatmentFileDto })
  @IsOptional()
  treatmentFile: TreatmentFileDto;

  @ApiProperty()
  @IsNotEmpty()
  treatmentInfo: string;
}
