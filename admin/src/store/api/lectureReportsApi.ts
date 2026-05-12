import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithToken } from './baseQuery';
import type {
    IAttendanceTimelinePoint,
    IFacultyBreakdownPoint,
    IInstructorPerformance,
    ILectureDashboardSummary,
    ILectureReportFilter,
} from '../../types/lectureReports';

function cleanFilters(filters?: ILectureReportFilter): Record<string, string> {
    const result: Record<string, string> = {};
    if (!filters) return result;
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
            result[k] = String(v);
        }
    });
    return result;
}

export const lectureReportsApi = createApi({
    reducerPath: 'lectureReportsApi',
    baseQuery: baseQueryWithToken,
    tagTypes: ['LectureReports'],
    endpoints: (builder) => ({
        getDashboardSummary: builder.query<
            ILectureDashboardSummary,
            ILectureReportFilter | void
        >({
            query: (filters) => ({
                url: '/dashboard/summary',
                params: cleanFilters(filters ?? undefined),
            }),
            providesTags: [{ type: 'LectureReports', id: 'summary' }],
        }),
        getAttendanceTimeline: builder.query<
            IAttendanceTimelinePoint[],
            ILectureReportFilter | void
        >({
            query: (filters) => ({
                url: '/reports/attendance',
                params: cleanFilters(filters ?? undefined),
            }),
            providesTags: [{ type: 'LectureReports', id: 'timeline' }],
        }),
        getFacultyBreakdown: builder.query<
            IFacultyBreakdownPoint[],
            ILectureReportFilter | void
        >({
            query: (filters) => ({
                url: '/reports/faculty',
                params: cleanFilters(filters ?? undefined),
            }),
            providesTags: [{ type: 'LectureReports', id: 'faculty' }],
        }),
        getInstructorPerformance: builder.query<
            IInstructorPerformance,
            { id: string; filters?: ILectureReportFilter }
        >({
            query: ({ id, filters }) => ({
                url: `/reports/instructors/${id}`,
                params: cleanFilters(filters),
            }),
            providesTags: (_r, _e, { id }) => [{ type: 'LectureReports', id }],
        }),
    }),
});

export const {
    useGetDashboardSummaryQuery,
    useGetAttendanceTimelineQuery,
    useGetFacultyBreakdownQuery,
    useGetInstructorPerformanceQuery,
} = lectureReportsApi;
