import { BaseApi } from './baseApi';
import type { ISemester } from '../../types/semester';

class SemesterApi extends BaseApi<ISemester> {
    constructor() {
        super('/semesters', {
            reducerPath: 'semesterApi',
            tagType: 'semesters',
        });
    }
}

export const semesterApi = new SemesterApi().createApi();

export const {
    useGetAllQuery: useGetAllSemestersQuery,
    useGetByIdQuery: useGetSemesterByIdQuery,
    useCreateMutation: useCreateSemesterMutation,
    useUpdateMutation: useUpdateSemesterMutation,
    useDeleteMutation: useDeleteSemesterMutation,
    useBulkDeleteMutation: useBulkDeleteSemestersMutation,
} = semesterApi;
