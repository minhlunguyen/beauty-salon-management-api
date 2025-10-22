import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetListSymptomDto } from '@src/salon/dtos/get-list-symptom.dto';
import { ErrorResponse } from '@src/common/contracts/openapi';
import { SymptomService } from '../../services/symptom.service';
import { FeatureService } from '@src/salon/services/feature.service';
import { AreaService } from '@src/salon/services/area.service';
import {
  AllDataResponse,
  BankBranchItemsResponse,
  BankItemsResponse,
  FeatureItemsResponse,
  ProvinceItemsResponse,
  StationItemsResponse,
  SymptomItemsResponse,
  AreaItemsResponse,
  LineItemsResponse,
} from '@src/salon/contracts/openapi';
import { StationService } from '@src/salon/services/station.service';
import { LineService } from '@src/salon/services/line.service';

import { BankService } from '@src/salon/services/bank.service';
import { BankBranchService } from '@src/salon/services/bank-branch.service';

@ApiTags('Master Data')
@Controller('common-data')
export class DataController {
  constructor(
    private symptomService: SymptomService,
    private featureService: FeatureService,
    private bankService: BankService,
    private bankBranchService: BankBranchService,
    private lineService: LineService,
    private stationService: StationService,
    private areaService: AreaService,
  ) {}

  @Get('/symptoms')
  @ApiOkResponse({ type: SymptomItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getSymptomList(@Query() params: GetListSymptomDto) {
    return await this.symptomService.getSymptomList(params);
  }

  @Get('/features')
  @ApiOkResponse({ type: FeatureItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getFeatureList() {
    return await this.featureService.getFeatureList();
  }

  @Get('/provinces')
  @ApiOkResponse({ type: ProvinceItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getProvinceList() {
    return await this.areaService.getProvinceList();
  }

  @Get('/prefectures')
  @ApiOkResponse({ type: ProvinceItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getPrefecturesList() {
    return await this.areaService.getProvinceList();
  }

  @Get('/prefectures/:provinceId/areas')
  @ApiOkResponse({ type: AreaItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getAreaListByProvince(@Param('provinceId') provinceId: number) {
    return await this.areaService.getAreaListByProvince(provinceId);
  }

  @Get('/banks')
  @ApiOkResponse({ type: BankItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getBankList() {
    return await this.bankService.getBankList();
  }

  @Get('/banks/:bankId/branches')
  @ApiOkResponse({ type: BankBranchItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getBranchList(
    @Param('bankId') bankId: string,
    @Query('keyword') keyword?: string,
  ) {
    return await this.bankBranchService.getBranchList({ bankId, keyword });
  }

  @Get('/all')
  @ApiOkResponse({ type: AllDataResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getMasterData() {
    return {
      provinces: await this.areaService.getProvinceList(),
      symptoms: await this.symptomService.getSymptomList(),
      features: await this.featureService.getFeatureList(),
    };
  }

  @Get('/lines')
  @ApiOkResponse({ type: LineItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getLineList() {
    return await this.lineService.getLineList();
  }

  @Get('/lines/:lineId/stations')
  @ApiOkResponse({ type: StationItemsResponse })
  @ApiBadRequestResponse({ type: ErrorResponse })
  async getStationList(@Param('lineId') lineId: number) {
    return await this.stationService.getStationList(lineId);
  }
}
