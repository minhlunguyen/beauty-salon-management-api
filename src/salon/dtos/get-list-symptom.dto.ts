import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SymptomTypes {
  AUTONOMIC = '1', // Autonomic Nervous System Symptoms
  NECK_SHOULDER = '2', // Neck and Shoulder Symptoms
  HIP_KNEE_FOOT = '3', // Hip, Knee, and Foot Symptoms
  SPORTS = '4', // Sports Injuries
  LOWER_BACK = '5', // Lower Back Symptoms
}

export class GetListSymptomDto {
  @ApiProperty({ required: false, enum: SymptomTypes })
  @IsOptional()
  @IsEnum(SymptomTypes)
  type?: number;
}
