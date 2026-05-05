import { BaseApi } from './baseApi';
import type { IAcademicYear } from '../../types/academicYear';

class AcademicYearApi extends BaseApi<IAcademicYear> {
    constructor() {
        super('/academic-years', {
            reducerPath: 'academicYearApi',
            tagType: 'academicYears',
        });
    }
}

export const academicYearApi = new AcademicYearApi().createApi();

export const {
    useGetAllQuery: useGetAllAcademicYearsQuery,
    useGetByIdQuery: useGetAcademicYearByIdQuery,
    useCreateMutation: useCreateAcademicYearMutation,
    useUpdateMutation: useUpdateAcademicYearMutation,
    useDeleteMutation: useDeleteAcademicYearMutation,
    useBulkDeleteMutation: useBulkDeleteAcademicYearsMutation,
} = academicYearApi;
