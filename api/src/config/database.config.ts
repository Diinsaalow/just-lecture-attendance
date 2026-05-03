import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { ConnectionStates, type Connection } from 'mongoose';

@Injectable()
export class DatabaseConfigService implements MongooseOptionsFactory {
  private readonly logger = new Logger(DatabaseConfigService.name);
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.configService.getOrThrow<string>('MONGODB_URI');

    this.logger.log('Connecting to MongoDB');
    this.logger.debug(`URI: ${this.sanitizeMongoUri(uri)}`);

    return {
      uri,
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => {
          this.logger.log('MongoDB connected');
        });

        connection.on('disconnected', () => {
          this.logger.warn('MongoDB disconnected');
        });

        connection.on('error', (error: Error) => {
          this.logger.error(`MongoDB connection error: ${error.message}`);
        });

        connection.on('reconnected', () => {
          this.logger.log('MongoDB reconnected');
        });

        if (connection.readyState === ConnectionStates.connected) {
          this.logger.log('MongoDB already connected');
        }

        return connection;
      },
    };
  }

  private sanitizeMongoUri(uri: string): string {
    try {
      const u = new URL(uri);
      if (u.password) u.password = '***';
      if (u.username) u.username = '***';
      return u.toString();
    } catch {
      return '(invalid uri)';
    }
  }
}
