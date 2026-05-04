import { BaseApi } from './baseApi';
import type { IEnrollment, IEnrollmentStatistics, IBulkDeleteEnrollmentResponse } from '../../types/enrollment';

class EnrollmentApi extends BaseApi<IEnrollment> {
    constructor() {
        super('/enrollments', {
            reducerPath: 'enrollmentApi',
            tagType: 'enrollments',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Statistics
                getEnrollmentStatistics: builder.query<IEnrollmentStatistics, string>({
                    query: (curriculum: string) => `/enrollments/statistics?curriculum=${curriculum}`,
                    providesTags: ['enrollmentStatistics' as any],
                }),

                // Get user's latest enrollments per level
                getLatestEnrollmentsPerLevel: builder.query<IEnrollment[], void>({
                    query: () => '/enrollments/current',
                    providesTags: ['enrollments' as any],
                }),

                // Get all user enrollments
                getAllUserEnrollments: builder.query<IEnrollment[], void>({
                    query: () => '/enrollments/all',
                    providesTags: ['enrollments' as any],
                }),

                // Cancel enrollment
                cancelEnrollment: builder.mutation<any, { id: string; data: { reason?: string } }>({
                    query: ({ id, data }) => ({
                        url: `/enrollments/${id}/cancel`,
                        method: 'PATCH',
                        body: data,
                    }),
                    invalidatesTags: ['enrollments' as any, 'enrollmentStatistics' as any],
                }),

                // Suspend enrollment
                suspendEnrollment: builder.mutation<any, { id: string; data: { reason?: string } }>({
                    query: ({ id, data }) => ({
                        url: `/enrollments/${id}/suspend`,
                        method: 'PATCH',
                        body: data,
                    }),
                    invalidatesTags: ['enrollments' as any, 'enrollmentStatistics' as any],
                }),

                // Export enrollments
                exportEnrollments: builder.mutation<Blob, { curriculum?: string; status?: string }>({
                    query: ({ curriculum, status }) => {
                        const params = new URLSearchParams();
                        if (curriculum) params.append('curriculum', curriculum);
                        if (status) params.append('status', status);
                        return {
                            url: `/enrollments/export?${params.toString()}`,
                            responseHandler: async (response) => await response.blob(),
                        };
                    },
                }),

                // Override bulk delete to correct response
                bulkDeleteEnrollments: builder.mutation<IBulkDeleteEnrollmentResponse, { ids: string[] }>({
                    query: (data) => ({
                        url: '/enrollments/bulk/delete',
                        method: 'DELETE',
                        body: data,
                    }),
                    invalidatesTags: ['enrollments' as any, 'enrollmentStatistics' as any],
                }),
            }),
            overrideExisting: false,
        });
    }
}

export const enrollmentApi = new EnrollmentApi().createApi();

export const {
    useGetAllQuery: useGetAllEnrollmentsQuery,
    useGetByIdQuery: useGetEnrollmentByIdQuery,
    useCreateMutation: useCreateEnrollmentMutation,
    useUpdateMutation: useUpdateEnrollmentMutation,
    useDeleteMutation: useDeleteEnrollmentMutation,
    useSearchQuery: useSearchEnrollmentsQuery,
    useBulkDeleteMutation,
    useBulkStoreMutation: useBulkStoreEnrollmentsMutation,
    useGetEnrollmentStatisticsQuery,
    useGetLatestEnrollmentsPerLevelQuery,
    useGetAllUserEnrollmentsQuery,
    useCancelEnrollmentMutation,
    useSuspendEnrollmentMutation,
    useExportEnrollmentsMutation,
    useBulkDeleteEnrollmentsMutation,
} = enrollmentApi;
