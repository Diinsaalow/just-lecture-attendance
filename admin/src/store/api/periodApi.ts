import { BaseApi } from './baseApi';
import type { IPeriod } from '../../types/period';

class PeriodApi extends BaseApi<IPeriod> {
    constructor() {
        super('/periods', {
            reducerPath: 'periodApi',
            tagType: 'periods',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                getPeriodsByClass: builder.query<IPeriod[], string>({
                    query: (classId) => `/periods/class/${classId}`,
                    providesTags: (result, error, classId) => [{ type: 'periods', id: `CLASS_${classId}` }],
                }),
            }),
        });
    }
}

export const periodApi = new PeriodApi().createApi();

export const {
    useGetAllQuery: useGetAllPeriodsQuery,
    useGetByIdQuery: useGetPeriodByIdQuery,
    useCreateMutation: useCreatePeriodMutation,
    useUpdateMutation: useUpdatePeriodMutation,
    useDeleteMutation: useDeletePeriodMutation,
    useBulkDeleteMutation: useBulkDeletePeriodsMutation,
    useGetPeriodsByClassQuery,
} = periodApi;
