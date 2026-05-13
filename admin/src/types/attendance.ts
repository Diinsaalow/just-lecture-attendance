export interface IAttendanceSettings {
    _id: string;
    lateThresholdMinutes: number;
    earlyCheckoutThresholdMinutes: number;
    checkInWindowBeforeMinutes: number;
    checkInWindowAfterMinutes: number;
    checkOutGracePeriodMinutes: number;
    geofenceEnabled: boolean;
    deviceValidationEnabled: boolean;
    qrCodeEnabled: boolean;
    timezone: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateAttendanceSettingsDto {
    lateThresholdMinutes: number;
    earlyCheckoutThresholdMinutes: number;
    checkInWindowBeforeMinutes: number;
    checkInWindowAfterMinutes: number;
    checkOutGracePeriodMinutes: number;
    geofenceEnabled: boolean;
    deviceValidationEnabled: boolean;
    qrCodeEnabled: boolean;
    timezone: string;
}

export interface IUpdateAttendanceSettingsDto extends Partial<ICreateAttendanceSettingsDto> {}
