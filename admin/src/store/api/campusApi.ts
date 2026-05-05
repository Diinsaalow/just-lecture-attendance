import { BaseApi } from './baseApi';
import type { ICampus } from '../../types/campus';

class CampusApi extends BaseApi<ICampus> {
    constructor() {
        super('/campuses', {
            reducerPath: 'campusApi',
            tagType: 'campuses',
        });
    }
}

export const campusApi = new CampusApi().createApi();

export const {
    useGetAllQuery: useGetAllCampusesQuery,
    useGetByIdQuery: useGetCampusByIdQuery,
    useCreateMutation: useCreateCampusMutation,
    useUpdateMutation: useUpdateCampusMutation,
    useDeleteMutation: useDeleteCampusMutation,
    useBulkDeleteMutation: useBulkDeleteCampusesMutation,
} = campusApi;
