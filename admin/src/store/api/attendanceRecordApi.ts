import { BaseApi } from './baseApi';
import type { IAttendanceRecordRow } from '../../types/attendanceRecord';

class AttendanceRecordApi extends BaseApi<IAttendanceRecordRow> {
    constructor() {
        super('/attendance', {
            reducerPath: 'attendanceRecordApi',
            tagType: 'AttendanceRecords',
        });
    }
}

export const attendanceRecordApi = new AttendanceRecordApi().createApi();

export const { useGetAllQuery: useGetAllAttendanceRecordsQuery, useGetByIdQuery: useGetAttendanceRecordByIdQuery } = attendanceRecordApi;
