import { BaseApi } from './baseApi';
import type { IFaculty } from '../../types/faculty';

class FacultyApi extends BaseApi<IFaculty> {
    constructor() {
        super('/faculties', {
            reducerPath: 'facultyApi',
            tagType: 'faculties',
        });
    }
}

export const facultyApi = new FacultyApi().createApi();

export const {
    useGetAllQuery: useGetAllFacultiesQuery,
    useGetByIdQuery: useGetFacultyByIdQuery,
    useCreateMutation: useCreateFacultyMutation,
    useUpdateMutation: useUpdateFacultyMutation,
    useDeleteMutation: useDeleteFacultyMutation,
    useBulkDeleteMutation: useBulkDeleteFacultiesMutation,
} = facultyApi;
