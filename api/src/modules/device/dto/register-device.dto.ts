import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  deviceModel: string;

  @IsString()
  @IsNotEmpty()
  devicePlatform: string;
}
