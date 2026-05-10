import { BaseApi } from './baseApi';
import type { IAttendanceSettings, ICreateAttendanceSettingsDto, IUpdateAttendanceSettingsDto } from '../../types/attendance';

class AttendanceSettingsApi extends BaseApi<IAttendanceSettings> {
    constructor() {
        super('/attendance-settings', {
            reducerPath: 'attendanceSettings',
            tagType: 'attendanceSettings',
        });
    }

    createApi() {
        const base = super.createApi();
        return base.injectEndpoints({
            endpoints: (builder) => ({
                getSettings: builder.query<IAttendanceSettings, void>({
                    query: () => ({ url: `/attendance-settings` }),
                    providesTags: [{ type: 'attendanceSettings', id: 'SINGLETON' }],
                }),
                createSettings: builder.mutation<IAttendanceSettings, ICreateAttendanceSettingsDto>({
                    query: (data) => ({
                        url: `/attendance-settings`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: [{ type: 'attendanceSettings', id: 'SINGLETON' }],
                }),
                updateSettings: builder.mutation<IAttendanceSettings, IUpdateAttendanceSettingsDto>({
                    query: (data) => ({
                        url: `/attendance-settings`,
                        method: 'PATCH',
                        body: data,
                    }),
                    invalidatesTags: [{ type: 'attendanceSettings', id: 'SINGLETON' }],
                }),
            }),
        });
    }
}

export const attendanceSettingsApi = new AttendanceSettingsApi().createApi();

export const {
    useGetSettingsQuery,
    useCreateSettingsMutation,
    useUpdateSettingsMutation,
} = attendanceSettingsApi;
