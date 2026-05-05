import { BaseApi } from './baseApi';
import type { IDepartment } from '../../types/department';

class DepartmentApi extends BaseApi<IDepartment> {
    constructor() {
        super('/departments', {
            reducerPath: 'departmentApi',
            tagType: 'departments',
        });
    }
}

export const departmentApi = new DepartmentApi().createApi();

export const {
    useGetAllQuery: useGetAllDepartmentsQuery,
    useGetByIdQuery: useGetDepartmentByIdQuery,
    useCreateMutation: useCreateDepartmentMutation,
    useUpdateMutation: useUpdateDepartmentMutation,
    useDeleteMutation: useDeleteDepartmentMutation,
    useBulkDeleteMutation: useBulkDeleteDepartmentsMutation,
} = departmentApi;
