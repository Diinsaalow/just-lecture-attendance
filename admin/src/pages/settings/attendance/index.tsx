import React, { useEffect } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Shield, Clock, MapPin, Smartphone, QrCode } from 'lucide-react';
import { useGetSettingsQuery, useCreateSettingsMutation, useUpdateSettingsMutation } from '../../../store/api/attendanceSettingsApi';
import { IAttendanceSettings } from '../../../types/attendance';

const attendanceSettingsSchema = z.object({
    lateThresholdMinutes: z.number().min(0, 'Must be a positive number'),
    earlyCheckoutThresholdMinutes: z.number().min(0, 'Must be a positive number'),
    checkInWindowBeforeMinutes: z.number().min(0, 'Must be a positive number'),
    checkInWindowAfterMinutes: z.number().min(0, 'Must be a positive number'),
    checkOutGracePeriodMinutes: z.number().min(0, 'Must be a positive number'),
    geofenceEnabled: z.boolean(),
    deviceValidationEnabled: z.boolean(),
    qrCodeEnabled: z.boolean(),
    timezone: z.string().min(1, 'Timezone is required'),
});

type FormValues = z.infer<typeof attendanceSettingsSchema>;

const AttendanceSettingsPage: React.FC = () => {
    const { data: settings, isLoading } = useGetSettingsQuery();
    const [createSettings, { isLoading: isCreating }] = useCreateSettingsMutation();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

    const isSaving = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useHookForm<FormValues>({
        resolver: zodResolver(attendanceSettingsSchema),
        defaultValues: {
            lateThresholdMinutes: 15,
            earlyCheckoutThresholdMinutes: 15,
            checkInWindowBeforeMinutes: 15,
            checkInWindowAfterMinutes: 15,
            checkOutGracePeriodMinutes: 15,
            geofenceEnabled: true,
            deviceValidationEnabled: true,
            qrCodeEnabled: true,
            timezone: 'Africa/Mogadishu',
        },
    });

    useEffect(() => {
        if (settings) {
            reset({
                lateThresholdMinutes: settings.lateThresholdMinutes,
                earlyCheckoutThresholdMinutes: settings.earlyCheckoutThresholdMinutes,
                checkInWindowBeforeMinutes: settings.checkInWindowBeforeMinutes,
                checkInWindowAfterMinutes: settings.checkInWindowAfterMinutes,
                checkOutGracePeriodMinutes: settings.checkOutGracePeriodMinutes,
                geofenceEnabled: settings.geofenceEnabled,
                deviceValidationEnabled: settings.deviceValidationEnabled,
                qrCodeEnabled: settings.qrCodeEnabled,
                timezone: settings.timezone || 'Africa/Mogadishu',
            });
        }
    }, [settings, reset]);

    const onSubmit = async (data: FormValues) => {
        try {
            if (settings?._id) {
                await updateSettings(data).unwrap();
            } else {
                await createSettings(data).unwrap();
            }
            toast.success('Attendance rules updated successfully');
        } catch (error: any) {
            console.error('Failed to update settings:', error);
            toast.error(error?.data?.message || 'Failed to update attendance rules');
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <span className="animate-spin border-4 border-primary border-l-transparent rounded-full w-10 h-10 inline-block align-middle m-auto mb-10"></span>
            </div>
        );
    }

    return (
        <div className="p-6 pt-0">
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-xl flex items-center font-bold text-gray-800 dark:text-white">
                        <Clock className="mr-2 h-6 w-6 text-primary" />
                        Attendance Rules
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure global thresholds and validation rules for instructor attendance tracking.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Time Thresholds Panel */}
                <div className="panel border-white-light dark:border-[#1b2e4b]">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                            <Clock className="w-5 h-5 mr-2" /> Time Thresholds (Minutes)
                        </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label htmlFor="checkInWindowBeforeMinutes" className="text-sm font-medium">Check-In Open Before Start</label>
                            <input
                                id="checkInWindowBeforeMinutes"
                                type="number"
                                className="form-input"
                                placeholder="15"
                                {...register('checkInWindowBeforeMinutes', { valueAsNumber: true })}
                            />
                            {errors.checkInWindowBeforeMinutes && <span className="text-xs text-danger">{errors.checkInWindowBeforeMinutes.message}</span>}
                            <p className="text-xs text-gray-500">How many minutes before the session starts instructors can check in.</p>
                        </div>
                        
                        <div className="space-y-1">
                            <label htmlFor="lateThresholdMinutes" className="text-sm font-medium">Late Threshold</label>
                            <input
                                id="lateThresholdMinutes"
                                type="number"
                                className="form-input"
                                placeholder="15"
                                {...register('lateThresholdMinutes', { valueAsNumber: true })}
                            />
                            {errors.lateThresholdMinutes && <span className="text-xs text-danger">{errors.lateThresholdMinutes.message}</span>}
                            <p className="text-xs text-gray-500">Minutes after start time when a check-in is flagged as LATE.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="checkInWindowAfterMinutes" className="text-sm font-medium">Check-In Open After Start</label>
                            <input
                                id="checkInWindowAfterMinutes"
                                type="number"
                                className="form-input"
                                placeholder="30"
                                {...register('checkInWindowAfterMinutes', { valueAsNumber: true })}
                            />
                            {errors.checkInWindowAfterMinutes && <span className="text-xs text-danger">{errors.checkInWindowAfterMinutes.message}</span>}
                            <p className="text-xs text-gray-500">How many minutes after the start time check-in is still accepted.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="earlyCheckoutThresholdMinutes" className="text-sm font-medium">Early Check-Out Threshold</label>
                            <input
                                id="earlyCheckoutThresholdMinutes"
                                type="number"
                                className="form-input"
                                placeholder="15"
                                {...register('earlyCheckoutThresholdMinutes', { valueAsNumber: true })}
                            />
                            {errors.earlyCheckoutThresholdMinutes && <span className="text-xs text-danger">{errors.earlyCheckoutThresholdMinutes.message}</span>}
                            <p className="text-xs text-gray-500">Minutes before scheduled end time; checking out earlier is flagged as EARLY CHECKOUT.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="checkOutGracePeriodMinutes" className="text-sm font-medium">Check-Out Grace Period</label>
                            <input
                                id="checkOutGracePeriodMinutes"
                                type="number"
                                className="form-input"
                                placeholder="15"
                                {...register('checkOutGracePeriodMinutes', { valueAsNumber: true })}
                            />
                            {errors.checkOutGracePeriodMinutes && <span className="text-xs text-danger">{errors.checkOutGracePeriodMinutes.message}</span>}
                            <p className="text-xs text-gray-500">How many minutes after the session ends instructors are still allowed to check out.</p>
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="timezone" className="text-sm font-medium text-primary">University Timezone (IANA)</label>
                            <input
                                id="timezone"
                                type="text"
                                className="form-input border-primary/30"
                                placeholder="Africa/Mogadishu"
                                {...register('timezone')}
                            />
                            {errors.timezone && <span className="text-xs text-danger">{errors.timezone.message}</span>}
                            <p className="text-xs text-gray-500">The timezone used for scheduled class periods (e.g. 'Africa/Mogadishu', 'Asia/Dubai').</p>
                        </div>
                    </div>
                </div>

                {/* Validation Toggles Panel */}
                <div className="panel border-white-light dark:border-[#1b2e4b]">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-semibold text-lg dark:text-white-light flex items-center">
                            <Shield className="w-5 h-5 mr-2" /> Validation Constraints
                        </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1 mr-3">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" {...register('geofenceEnabled')} />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                            <div>
                                <h6 className="font-semibold text-base flex items-center"><MapPin className="w-4 h-4 mr-1 text-primary"/> Geofence Validation</h6>
                                <p className="text-sm text-gray-500">Require instructor's GPS to be within the assigned classroom's radius during check-in and check-out.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1 mr-3">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" {...register('deviceValidationEnabled')} />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                            <div>
                                <h6 className="font-semibold text-base flex items-center"><Smartphone className="w-4 h-4 mr-1 text-primary"/> Device Validation</h6>
                                <p className="text-sm text-gray-500">Restrict instructors to only checking in from their single, registered mobile device.</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1 mr-3">
                                <label className="w-12 h-6 relative">
                                    <input type="checkbox" className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" {...register('qrCodeEnabled')} />
                                    <span className="outline_checkbox bg-icon border-2 border-[#ebedf2] dark:border-white-dark block h-full rounded-full before:absolute before:left-1 before:bg-[#ebedf2] dark:before:bg-white-dark before:bottom-1 before:w-4 before:h-4 before:rounded-full before:bg-[url(/assets/images/close.svg)] before:bg-no-repeat before:bg-center peer-checked:before:left-7 peer-checked:before:bg-[url(/assets/images/checked.svg)] peer-checked:border-primary peer-checked:before:bg-primary before:transition-all before:duration-300"></span>
                                </label>
                            </div>
                            <div>
                                <h6 className="font-semibold text-base flex items-center"><QrCode className="w-4 h-4 mr-1 text-primary"/> QR Code Fallback</h6>
                                <p className="text-sm text-gray-500">Allow scanning a static classroom QR code if biometric check-in fails or is unavailable.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-5 h-5 inline-block align-middle mr-2"></span>
                                Saving...
                            </>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceSettingsPage;
