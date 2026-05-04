import { BaseApi } from './baseApi';
import { ILocation } from '../../types/location';

class LocationApi extends BaseApi<ILocation> {
    constructor() {
        super('/locations', {
            reducerPath: 'locationApi',
            tagType: 'locations',
        });
    }
}

export const locationApi = new LocationApi().createApi();

export const {
    useGetAllQuery: useGetAllLocationsQuery,
    useGetByIdQuery: useGetLocationByIdQuery,
    useCreateMutation: useCreateLocationMutation,
    useUpdateMutation: useUpdateLocationMutation,
    useDeleteMutation: useDeleteLocationMutation,
    useBulkDeleteMutation: useBulkDeleteLocationsMutation,
} = locationApi;
