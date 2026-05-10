import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CheckInMethod } from '../enums/check-in-method.enum';

export class CheckOutDto {
  @IsMongoId()
  @IsNotEmpty()
  sessionId: string;

  @IsEnum(CheckInMethod)
  method: CheckInMethod;

  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  deviceId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  /** Required when method === QR_CODE. */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  qrPayload?: string;

  // ── Wi-Fi SSID — deferred for later implementation ──
  // @IsOptional()
  // @IsString()
  // wifiSsid?: string;
}
