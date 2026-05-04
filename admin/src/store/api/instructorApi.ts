import { BaseApi } from './baseApi';
import type { IUser } from '../../types/auth';

class InstructorApi extends BaseApi<IUser> {
    constructor() {
        super('/users/instructor', {
            reducerPath: 'instructors',
            tagType: 'instructors',
        });
    }
}

export const instructorApi = new InstructorApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllInstructorsQuery,
    useGetByIdQuery: useGetInstructorByIdQuery,
    useCreateMutation: useCreateInstructorMutation,
    useUpdateMutation: useUpdateInstructorMutation,
    useDeleteMutation: useDeleteInstructorMutation,
    useSearchQuery: useSearchInstructorsQuery,
    useBulkDeleteMutation: useBulkDeleteInstructorsMutation,
    useBulkStoreMutation: useBulkStoreInstructorsMutation,
} = instructorApi;
