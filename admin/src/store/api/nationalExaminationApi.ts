import { BaseApi } from './baseApi';
import type { INationalExamination } from '../../types/national-examination';

class NationalExaminationApi extends BaseApi<INationalExamination> {
    constructor() {
        super('/national-examinations', {
            reducerPath: 'nationalExaminationApi',
            tagType: 'nationalExaminations',
        });
    }
}

export const nationalExaminationApi = new NationalExaminationApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllNationalExaminationsQuery,
    useGetByIdQuery: useGetNationalExaminationByIdQuery,
    useCreateMutation: useCreateNationalExaminationMutation,
    useUpdateMutation: useUpdateNationalExaminationMutation,
    useDeleteMutation: useDeleteNationalExaminationMutation,
    useSearchQuery: useSearchNationalExaminationsQuery,
    useBulkDeleteMutation: useBulkDeleteNationalExaminationsMutation,
    useBulkStoreMutation: useBulkStoreNationalExaminationsMutation,
} = nationalExaminationApi;
