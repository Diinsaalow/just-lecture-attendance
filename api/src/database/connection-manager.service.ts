import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConnectionStates, type Connection } from 'mongoose';

@Injectable()
export class ConnectionManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConnectionManagerService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit(): void {
    setTimeout(() => {
      const status = this.getConnectionStatus();
      const dbName = this.getDatabaseName();

      this.logger.log(`Connection status: ${status}`);
      this.logger.log(`Database name: ${dbName}`);

      if (this.isConnected()) {
        this.logger.log('Database is ready');
      } else {
        this.logger.warn('Database is not connected yet');
      }
    }, 1000);
  }

  getConnection(): Connection {
    return this.connection;
  }

  isConnected(): boolean {
    return this.connection.readyState === ConnectionStates.connected;
  }

  getConnectionStatus(): string {
    switch (this.connection.readyState) {
      case ConnectionStates.disconnected:
        return 'disconnected';
      case ConnectionStates.connected:
        return 'connected';
      case ConnectionStates.connecting:
        return 'connecting';
      case ConnectionStates.disconnecting:
        return 'disconnecting';
      case ConnectionStates.uninitialized:
        return 'uninitialized';
      default:
        return 'unknown';
    }
  }

  getDatabaseName(): string {
    return this.connection.db?.databaseName ?? 'unknown';
  }

  async closeConnection(): Promise<void> {
    if (this.connection.readyState !== ConnectionStates.disconnected) {
      await this.connection.close();
      this.logger.log('MongoDB connection closed');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeConnection();
  }
}
