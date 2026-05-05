import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampusModule } from '../campus/campus.module';
import { Hall, HallSchema } from './schemas/hall.schema';
import { HallController } from './hall.controller';
import { HallService } from './hall.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Hall.name, schema: HallSchema }]),
    CampusModule,
  ],
  controllers: [HallController],
  providers: [HallService],
  exports: [HallService],
})
export class HallModule {}
