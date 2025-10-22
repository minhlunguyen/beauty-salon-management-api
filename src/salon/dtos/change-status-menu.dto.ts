import { PickType } from '@nestjs/swagger';
import { CreateMenuDto } from '@src/salon/dtos/create-menu.dto';

export class ChangeStatusMenuDto extends PickType(CreateMenuDto, [
  'status',
] as const) {}
