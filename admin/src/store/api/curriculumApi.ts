import { BaseApi } from './baseApi';
import type { ICurriculum } from '../../types/curriculum';

class CurriculumApi extends BaseApi<ICurriculum> {
    constructor() {
        super('/curriculums', {
            reducerPath: 'curriculumApi',
            tagType: 'curriculums',
        });
    }
}

export const curriculumApi = new CurriculumApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllCurriculumsQuery,
    useGetByIdQuery: useGetCurriculumByIdQuery,
    useCreateMutation: useCreateCurriculumMutation,
    useUpdateMutation: useUpdateCurriculumMutation,
    useDeleteMutation: useDeleteCurriculumMutation,
    useSearchQuery: useSearchCurriculumsQuery,
    useBulkDeleteMutation: useBulkDeleteCurriculumsMutation,
    useBulkStoreMutation: useBulkStoreCurriculumsMutation,
} = curriculumApi;
