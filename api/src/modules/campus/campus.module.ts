import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campus, CampusSchema } from './schemas/campus.schema';
import { CampusController } from './campus.controller';
import { CampusService } from './campus.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Campus.name, schema: CampusSchema }]),
  ],
  controllers: [CampusController],
  providers: [CampusService],
  exports: [CampusService],
})
export class CampusModule {}
