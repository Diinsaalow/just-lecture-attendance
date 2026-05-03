import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from '../config/database.config';
import { ConnectionManagerService } from './connection-manager.service';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
  ],
  providers: [DatabaseConfigService, ConnectionManagerService],
  exports: [DatabaseConfigService, ConnectionManagerService],
})
export class DatabaseModule {}
