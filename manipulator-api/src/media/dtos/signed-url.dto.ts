import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SignedUrl {
  @ApiProperty()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty()
  @IsNotEmpty()
  isPublic: boolean;

  @ApiProperty()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty()
  @IsOptional()
  group: string;
}

export class SignedUrlDto {
  @ApiProperty({ isArray: true, type: SignedUrl })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => SignedUrl)
  signedUrls: SignedUrl[];
}
