import { Type } from 'class-transformer';
import { IsBoolean, IsInt, Min } from 'class-validator';

/** Used for the initial creation of the attendance settings singleton. */
export class CreateAttendanceSettingsDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lateThresholdMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  earlyCheckoutThresholdMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkInWindowBeforeMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkInWindowAfterMinutes: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  checkOutGracePeriodMinutes: number;

  @IsBoolean()
  geofenceEnabled: boolean;

  @IsBoolean()
  deviceValidationEnabled: boolean;

  @IsBoolean()
  qrCodeEnabled: boolean;
}
