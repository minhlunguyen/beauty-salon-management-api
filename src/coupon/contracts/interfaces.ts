export interface IQueryOptions {
  page?: number;
  limit?: number;
  withTag?: string;
  withoutTag?: string;
  customerId?: string;
  servicerId?: string;
  code?: string;
  sort?: string;
  order?: string;
  type?: CouponType;
  status?: CouponStatus;
}

export interface IAvailableQueryOptions extends IQueryOptions {
  customerId: string;
}

export interface ITransactionQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  servicerId?: string;
  code?: string;
  couponId?: number;
  sort?: string;
  order?: string;
}

export enum CouponType {
  PRIVATE = 'Private',
  PUBLIC = 'Public',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  USED = 'USED',
  CANCELED = 'CANCELED',
}

export enum IssueType {
  COUPON = 'COUPON',
}

export enum IssuedTicketStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  COMPLETED = 'COMPLETED',
}

export interface CouponRules {
  availableDays: number;
  allowMenuIds: string[];
  allowCustomerIds: string[];
  timezone: string;
  start?: Date;
  end?: Date;
  limitPerUser?: number;
  maxServiceUsage?: number;
  min?: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface ICouponOutput {
  id: number;
  appId: string;
  announcementId?: string;
  code: string;
  title: string;
  description: string;
  currency: string;
  amount: number;
  quantumUsage: number;
  status: CouponStatus;
  type: CouponType;
  quantumIssueUsage?: number;
  servicerId: string;
  announcement?: any;
  tags?: Tag[];
  rules: CouponRules;
  createdAt: Date;
  updatedAt: Date;
  expiredAt?: Date;
}

export interface IPagination {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
}

export interface IPaginationOutput<T> extends IPagination {
  items: T[];
}

export interface ICreateCouponInput {
  code?: string;
  title: string;
  description?: string;
  currency: string;
  amount: number;
  status: CouponStatus;
  type: CouponType;
  servicerId: string;
  rules?: ICouponRulesInput;
}

export interface ICouponRulesInput {
  allowMenuIds?: string[];
  ableToIssueMultiple?: boolean;
  availableDays?: number;
  issueCouponNumber?: number;
}

export interface IUpdateCouponInput {
  title: string;
  type?: CouponType;
  servicerId?: string;
  rules?: ICouponRulesInput;
}

export interface IIssueCouponInput {
  code: string;
  type: IssueType;
  customerId: string;
}

export interface IIssuedCoupon {
  id: number;
  couponId: number;
  parentType: string;
  parentId: number;
  couponCode: string;
  customerId: string;
  status: CouponStatus;
  tags?: number[];
  usedAt?: Date;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIssueCouponOutput {
  coupon: ICouponOutput;
  issuedCoupons: IIssuedCoupon[];
}

export interface IAvailableCouponOutput extends ICouponOutput {
  availableCount: number;
  quantumIssueUsage?: number;
}

export interface IUseCouponInput {
  appTransactionId: string;
  totalPrice: number;
  customerId: string;
  servicerId: string;
  menuId: string;
  salonId: string;
  bookingDatetime?: string;
  serviceUsageCount?: number;
}

export interface ICompleteCouponInput {
  appTransactionId: string;
  customerId: string;
  code: string;
}

export interface IUseCouponOutput {
  id: number;
  appId: string;
  couponId: number;
  appTransactionId: string;
  customerId: string;
  servicerId: string;
  status: CouponStatus;
  couponAmount: number;
  totalAmount: number;
  bookedAt?: Date;
  managedByServicer?: number;
  issuedCouponId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionOutput {
  id: number;
  appId: string;
  couponId: number;
  appTransactionId: string;
  customerId: string;
  servicerId: string;
  status: TransactionStatus;
  couponAmount: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  issuedCouponId?: number;
  completedAt?: Date;
  cancelledAt?: Date;
  bookedAt?: Date;
  managedByServicer: number;
  salonId: string;
  couponCode: string;
  tags: Tag[];
}

export interface ICreateTicketInput {
  ticketName: string;
  menuId: string;
  availableDays: number;
  servicerId: string;
  numberOfTicket: number;
}
export interface ICreateTicketOutput {
  id: number;
  code: string;
}

export interface IGetTicketInput {
  limit: number;
  skip: number;
  keyword?: string;
}

export interface ICustomerTicket {
  ticketId: string;
  name?: string;
  expiredAt: Date;
  availableCount: number;
}

export interface IUpdateTicketInput {
  ticketName: string;
  availableDays: number;
  numberOfTicket: number;
  servicerId: string;
  menuId: string;
}

export interface IChangeMenuTicketResult {
  couponId: number;
  code?: string;
  isUpdate?: boolean;
  isCreate?: boolean;
  oldCouponData?: IUpdateTicketInput;
}
