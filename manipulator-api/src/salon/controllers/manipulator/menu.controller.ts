import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Get,
  Put,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@src/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@src/auth/guards/jwt.guard';
import { ErrorResponse, SuccessResponse } from '@src/common/contracts/openapi';
import { CreateMenuDto } from '@src/salon/dtos/create-menu.dto';
import { UpdateMenuDto } from '@src/salon/dtos/update-menu.dto';
import { MenuService } from '@src/salon/services/menu.service';
import { pagination } from '@src/common/decorators/pagination';
import {
  MenuListResponse,
  FilterMenuListDto,
  MenuDetailRepsonse,
} from '@src/salon/dtos/menu-list.dto';
import { ChangeStatusMenuDto } from '@src/salon/dtos/change-status-menu.dto';
import { SalonOwnerParam } from '@src/salon/decorators/salon-owner-param.decorator';
import { PaginateDto } from '@src/common/dtos/paginate.dto';

@Controller(':salonId/menu')
@UseGuards(JwtAuthGuard)
@Role('manipulator')
@ApiTags('Salon (Manipulator)')
@ApiBearerAuth()
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Post('/create-menu')
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async add(
    @Req() req,
    @SalonOwnerParam('salonId') salonId: string,
    @Body() data: CreateMenuDto,
  ) {
    const { _id } = req.user;
    return this.menuService.createMenu(_id, salonId, data);
  }

  @Get('/list')
  @ApiOkResponse({ type: MenuListResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  @ApiQuery({ type: PaginateDto })
  async getMenuBySalonId(
    @Req() req,
    @SalonOwnerParam('salonId') salonId: string,
    @pagination() paginationParam: PaginateDto,
    @Param() filterMenu: FilterMenuListDto,
  ) {
    const { _id } = req.user;
    const result = await this.menuService.getMenuList(
      _id,
      salonId,
      filterMenu,
      paginationParam,
    );
    return result;
  }

  @Put('/:menuId')
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async updateMenu(
    @SalonOwnerParam('salonId') salonId: string,
    @Param('menuId') menuId: string,
    @Body() data: UpdateMenuDto,
  ) {
    return this.menuService.updateMenu(menuId, salonId, data);
  }

  @Get('/:menuId')
  @ApiOkResponse({ type: MenuDetailRepsonse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async menuInfo(
    @Param('salonId') salonId: string,
    @Param('menuId') menuId: string,
    @Req() req,
  ) {
    const manipulatorId = req.user._id;
    return this.menuService.getMenuInfo(menuId, salonId, manipulatorId);
  }

  @Patch(':menuId/change-status')
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async update(
    @SalonOwnerParam('salonId') salonId: string,
    @Body() changeStatusMenuDto: ChangeStatusMenuDto,
    @Param('menuId') menuId: string,
    @Req() req,
  ) {
    const manipulatorId = req.user._id;
    const result = await this.menuService.changeStatus(
      menuId,
      salonId,
      manipulatorId,
      changeStatusMenuDto,
    );
    return result;
  }

  @Delete('/:menuId')
  @ApiCreatedResponse({ type: SuccessResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async deleteMenu(
    @SalonOwnerParam('salonId') salonId: string,
    @Param('menuId') menuId: string,
  ) {
    return this.menuService.deleteMenu(menuId, salonId);
  }
}
