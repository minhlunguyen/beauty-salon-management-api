import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { SearchManipulatorDto } from '@src/account/dtos/search-manipulator-dto.dto';
import { SearchManipulatorResponse } from '@src/account/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';
import { PaginateDto } from '@src/common/dtos/paginate.dto';

@ApiTags('Public')
@Controller('/search/manipulator')
export class SearchManipulatorController {
  constructor(private manipulatorService: ManipulatorService) {}

  @Get()
  @ApiQuery({ type: PaginateDto })
  @ApiOkResponse({ type: SearchManipulatorResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async search(
    @pagination() paginateDto: PaginateDto,
    @Query() searchDto: SearchManipulatorDto,
  ) {
    return this.manipulatorService.find(searchDto, {
      ...paginateDto,
    });
  }
}
