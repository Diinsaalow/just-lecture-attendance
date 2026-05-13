import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAttendanceSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lateThresholdMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  earlyCheckoutThresholdMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkInWindowBeforeMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkInWindowAfterMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkOutGracePeriodMinutes?: number;

  @IsOptional()
  @IsBoolean()
  geofenceEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  deviceValidationEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  qrCodeEnabled?: boolean;

  @IsOptional()
  timezone?: string;
}
