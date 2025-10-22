import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationModule } from '@src/reservation/reservation.module';
import { OperatorSaleController } from './controllers/operator/sale.controller';
import { SaleRepository } from './repositories/sale.repository';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { SaleService } from './services/sale.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sale.name, schema: SaleSchema }]),
    ReservationModule,
  ],
  providers: [SaleRepository, SaleService],
  exports: [SaleService],
  controllers: [OperatorSaleController],
})
export class SaleModule {}
