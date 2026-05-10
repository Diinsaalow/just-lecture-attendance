import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Hall, HallSchema } from '../hall/schemas/hall.schema';
import { HallQrController } from './hall-qr.controller';
import { HallQrService } from './hall-qr.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
  ],
  controllers: [HallQrController],
  providers: [HallQrService],
  exports: [HallQrService],
})
export class HallQrModule {}
