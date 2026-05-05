import { BaseApi } from './baseApi';
import type { IPeriod } from '../../types/period';

class PeriodApi extends BaseApi<IPeriod> {
    constructor() {
        super('/periods', {
            reducerPath: 'periodApi',
            tagType: 'periods',
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
} = periodApi;
