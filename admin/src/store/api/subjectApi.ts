import { BaseApi } from './baseApi';
import type { ISubject, ISubjectDetails } from '../../types/subject';

class SubjectApi extends BaseApi<ISubject> {
    constructor() {
        super('/subjects', {
            reducerPath: 'subjectApi',
            tagType: 'subjects',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                getSubjectDetails: builder.query<ISubjectDetails, string>({
                    query: (id) => `subjects/${id}/details`,
                    providesTags: ['subjects'],
                }),
            }),
        });
    }
}

export const subjectApi = new SubjectApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllSubjectsQuery,
    useGetByIdQuery: useGetSubjectByIdQuery,
    useCreateMutation: useCreateSubjectMutation,
    useUpdateMutation: useUpdateSubjectMutation,
    useDeleteMutation: useDeleteSubjectMutation,
    useSearchQuery: useSearchSubjectsQuery,
    useBulkDeleteMutation: useBulkDeleteSubjectsMutation,
    useBulkStoreMutation: useBulkStoreSubjectsMutation,
    useGetSubjectDetailsQuery: useGetSubjectDetailsQuery,
} = subjectApi;
