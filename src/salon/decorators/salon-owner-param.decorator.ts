import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppException } from '@src/common/exceptions/app.exception';
import { Errors } from '@src/salon/contracts/error';

export const SalonOwnerParam = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const salonId = request.params[data];

    const ownerSalon = user.salon?.find(
      (ele) => ele.salonId.toString() === salonId && ele.authority === 'owner',
    );

    if (!ownerSalon) {
      const { code, message, status } = Errors.PERMISSION_DENIED;
      throw new AppException(code, message, status);
    }

    return salonId;
  },
);
