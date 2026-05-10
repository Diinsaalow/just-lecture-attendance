export interface IAttendanceSettings {
    _id?: string;
    lateThresholdMinutes: number;
    earlyCheckoutThresholdMinutes: number;
    checkInWindowBeforeMinutes: number;
    checkInWindowAfterMinutes: number;
    checkOutGracePeriodMinutes: number;
    geofenceEnabled: boolean;
    deviceValidationEnabled: boolean;
    qrCodeEnabled: boolean;
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
}

export interface IUpdateAttendanceSettingsDto extends Partial<ICreateAttendanceSettingsDto> {}
