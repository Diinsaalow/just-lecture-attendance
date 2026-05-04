import { BaseApi } from './baseApi';
import type { IClass } from '../../types/class';

class ClassApi extends BaseApi<IClass> {
    constructor() {
        super('/classes', {
            reducerPath: 'classApi',
            tagType: 'classes',
        });
    }
}

export const classApi = new ClassApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllClassesQuery,
    useGetByIdQuery: useGetClassByIdQuery,
    useCreateMutation: useCreateClassMutation,
    useUpdateMutation: useUpdateClassMutation,
    useDeleteMutation: useDeleteClassMutation,
    useSearchQuery: useSearchClassesQuery,
    useBulkDeleteMutation: useBulkDeleteClassesMutation,
    useBulkStoreMutation: useBulkStoreClassesMutation,
} = classApi;
