import { ApiProperty } from '@nestjs/swagger';
import { PaginateResultResponse } from '@src/common/contracts/openapi';
import { Feature } from '@src/salon/contracts/value-object';
import { Customer } from '../schemas/customer.schema';
import { Manipulator } from '../schemas/manipulator.schema';
import { AuthToken } from './type';

export class VerifyTokenData {
  @ApiProperty()
  token: string;
}

export class VerifySuccessResponse {
  @ApiProperty({ type: VerifyTokenData })
  data: VerifyTokenData;
}

export class PhotoItem {
  @ApiProperty()
  type: string;

  @ApiProperty()
  objectKey: string;

  @ApiProperty()
  url: string;
}

export class ManipulatorListItem {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  salon: any[];

  @ApiProperty()
  careerStart: string;

  @ApiProperty()
  nationalLicenses: string[];

  @ApiProperty()
  pr: string;

  @ApiProperty()
  profile: string;

  @ApiProperty({ type: PhotoItem, isArray: true })
  photos: PhotoItem[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginateResultManipulatorResponse extends PaginateResultResponse {
  @ApiProperty({ isArray: true, type: ManipulatorListItem })
  docs: ManipulatorListItem[];
}

export class ListManipulatorResponse {
  @ApiProperty({ type: PaginateResultManipulatorResponse })
  data: PaginateResultManipulatorResponse;
}

export class PaginateResultCustomerResponse extends PaginateResultResponse {
  @ApiProperty({ isArray: true, type: Customer })
  docs: Customer[];
}

export class CustomerRegisterOutput extends Customer {
  @ApiProperty({ type: AuthToken })
  authToken: AuthToken;
}

export class CustomerRegisterResponse {
  @ApiProperty({ type: CustomerRegisterOutput })
  data: CustomerRegisterOutput;
}

export class ListCustomerResponse {
  @ApiProperty({ type: PaginateResultCustomerResponse })
  data: PaginateResultCustomerResponse;
}

export class SearchManipulatorPhotoItem {
  @ApiProperty()
  type: string;

  @ApiProperty()
  url: string;
}

export class SearchManipulatorSalonItem {
  @ApiProperty()
  salonId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty({ isArray: true, type: String })
  access: string[];

  @ApiProperty({ type: Feature, isArray: true })
  features: Feature[];

  @ApiProperty({ type: PhotoItem, isArray: true })
  photos: PhotoItem[];
}

export class SearchManipulatorSymptomItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class SearchManipulatorRatingItem {
  @ApiProperty()
  total: number;

  @ApiProperty()
  averageRating: number;
}

export class SearchManipulatorItem {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana: string;

  @ApiProperty()
  pr: string;

  @ApiProperty()
  profile: string;

  @ApiProperty()
  careerStart: string;

  @ApiProperty({ isArray: true, type: SearchManipulatorPhotoItem })
  photo: SearchManipulatorPhotoItem[];

  @ApiProperty()
  nationalLicenses: string[];

  @ApiProperty({ isArray: true, type: SearchManipulatorSalonItem })
  salons: SearchManipulatorSalonItem[];

  @ApiProperty({ isArray: true, type: SearchManipulatorSymptomItem })
  symptoms: SearchManipulatorSymptomItem[];

  @ApiProperty({ type: SearchManipulatorRatingItem })
  reviewRating: SearchManipulatorRatingItem;
}

export class SearchManipulator {
  @ApiProperty({ isArray: true, type: SearchManipulatorItem })
  docs: SearchManipulatorItem[];

  @ApiProperty()
  totalDocs: number;
}

export class SearchManipulatorResponse {
  @ApiProperty({ type: SearchManipulator })
  data: SearchManipulator;
}

export class ManipulatorResponse {
  @ApiProperty({ type: Manipulator })
  data: Manipulator;
}

export class CustomerDetailResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  birthday?: string;

  @ApiProperty()
  gender: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  emailVerified: boolean;
}

export class CustomerResponse {
  @ApiProperty({ type: CustomerDetailResponse })
  data: CustomerDetailResponse;
}

export class OperatorCustomerDetail {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nameKana?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  registryDate: string;

  @ApiProperty()
  CardNumber: string;

  @ApiProperty()
  CardExpire: string;

  @ApiProperty()
  lastLogin: string;
}

export class OperatorCustomerResponse {
  @ApiProperty({ type: OperatorCustomerDetail })
  data: OperatorCustomerDetail;
}

export class OperatorRoleListItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class OperatorRolePaginateResponse extends PaginateResultResponse {
  @ApiProperty({ isArray: true, type: OperatorRoleListItem })
  docs: OperatorRoleListItem[];
}

export class OperatorRoleItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class OperatorListItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ isArray: true, type: OperatorRoleItem })
  roles: OperatorRoleItem[];

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiProperty({ type: Date })
  lastLogin?: Date;
}

export class OperatorListPaginateResponse extends PaginateResultResponse {
  @ApiProperty({ isArray: true, type: OperatorListItem })
  docs: OperatorListItem[];
}
