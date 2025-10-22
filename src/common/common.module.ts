import { Module, Global } from '@nestjs/common';

import { AppLogger } from './services/app-logger.service';
import { VerificationService } from './services/verification.service';
import { DateUtilService } from './services/date-utils.service';
import { CommonUtilService } from './services/common-utils.service';
@Global()
@Module({
  providers: [
    AppLogger,
    VerificationService,
    DateUtilService,
    CommonUtilService,
  ],
  exports: [AppLogger, VerificationService, DateUtilService, CommonUtilService],
})
export class CommonModule {}
