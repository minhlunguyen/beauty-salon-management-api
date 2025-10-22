import { Controller, Post, Body } from '@nestjs/common';
import { S3Service } from '@src/media/services/s3.service';
import { SignedUrlDto } from '@src/media/dtos/signed-url.dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { SignedUrlItemsResponse } from '@src/media/contracts/openapi';

@Controller('common/signedUrlForPuttingObject')
@ApiTags('Media')
export class S3Controller {
  constructor(private s3Service: S3Service) {}

  @Post()
  @ApiOkResponse({ type: SignedUrlItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async createSignedUrlForPuttingObject(@Body() signedUrlDto: SignedUrlDto) {
    const result = await this.s3Service.createSignedUrlForPuttingObject(
      signedUrlDto.signedUrls,
    );
    return result;
  }
}
