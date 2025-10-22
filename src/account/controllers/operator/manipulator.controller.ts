import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ListManipulatorResponse,
  ManipulatorResponse,
} from '@src/account/contracts/openapi';
import { ManipulatorService } from '@src/account/services/manipulator.services';
import { Auth0AuthGuard } from '@src/auth/guards/auth0.guard';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { pagination } from '@src/common/decorators/pagination';

@ApiTags('Operator')
@Controller('operator/manipulators')
@ApiBearerAuth()
@UseGuards(Auth0AuthGuard)
export class ManipulatorController {
  constructor(private manipulatorService: ManipulatorService) {}

  @Get()
  @ApiOkResponse({ type: ListManipulatorResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async findAll(@pagination() paginationParam) {
    const result = await this.manipulatorService.getManipulatorList(
      paginationParam,
    );
    return result;
  }

  @Get(':id')
  @ApiOkResponse({ type: ManipulatorResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async get(@Param('id') manId: string) {
    return this.manipulatorService.findById(manId);
  }
}
