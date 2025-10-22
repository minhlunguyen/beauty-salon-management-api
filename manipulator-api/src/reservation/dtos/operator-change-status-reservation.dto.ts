import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OperatorChangeStatusAction } from '@src/reservation/contracts/types';
export class OperatorChangeStatusReservation {
  @ApiProperty({
    enum: OperatorChangeStatusAction,
  })
  @IsEnum(OperatorChangeStatusAction)
  action: OperatorChangeStatusAction;
}
