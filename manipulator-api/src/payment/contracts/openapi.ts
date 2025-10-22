import { ApiProperty } from '@nestjs/swagger';
import { IMethodItem, IMethodItemDetail } from '../services/veritrans.service';

export class MethodItemDetail implements IMethodItemDetail {
  @ApiProperty()
  kind: string;

  @ApiProperty()
  expireMonth: string;

  @ApiProperty()
  expireYear: string;

  @ApiProperty()
  lastNumber: string;

  @ApiProperty()
  default: boolean;

  @ApiProperty()
  brand: string;
}

export class MethodItem implements IMethodItem {
  @ApiProperty()
  id: string;

  @ApiProperty()
  kind: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ type: MethodItemDetail })
  details: IMethodItemDetail;
}

export class MethodItems {
  @ApiProperty({ isArray: true, type: MethodItem })
  items: MethodItem[];
}

export class MethodItemsResponse {
  @ApiProperty({ type: MethodItems })
  data: MethodItems;
}

export class AddCardOutput {
  @ApiProperty({ type: Boolean })
  isCreated: boolean;

  @ApiProperty({ isArray: true, type: MethodItem })
  items?: MethodItem[];
}

export class AddCardResponse {
  @ApiProperty({ type: AddCardOutput })
  data: AddCardOutput;
}
