import { BaseApi } from './baseApi';
import type { IUser } from '../../types/auth';

class StudentApi extends BaseApi<IUser> {
    constructor() {
        super('/users/student', {
            reducerPath: 'students',
            tagType: 'students',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                downloadAll: builder.mutation<Blob, void>({
                    query: () => ({
                        url: `${this.endpoint}/export`,
                        responseHandler: async (response) => await response.blob(),
                    }),
                }),
                quickCreate: builder.mutation<IUser, { phone: string }>({
                    query: (body) => ({
                        url: `${this.endpoint}/quick-create`,
                        method: 'POST',
                        body,
                    }),
                    invalidatesTags: ['students'],
                }),
            }),
        });
    }
}

export const studentApi = new StudentApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllStudentsQuery,
    useGetByIdQuery: useGetStudentByIdQuery,
    useCreateMutation: useCreateStudentMutation,
    useUpdateMutation: useUpdateStudentMutation,
    useDeleteMutation: useDeleteStudentMutation,
    useSearchQuery: useSearchStudentsQuery,
    useBulkDeleteMutation: useBulkDeleteStudentsMutation,
    useBulkStoreMutation: useBulkStoreStudentsMutation,
    useDownloadAllMutation: useDownloadAllStudentsMutation,
    useQuickCreateMutation: useQuickCreateStudentMutation,
} = studentApi;
