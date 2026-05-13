import { BaseApi } from './baseApi';
import type { IUser } from '../../types/auth';

class DeviceApi extends BaseApi<IUser> {
    constructor() {
        super('/devices', {
            reducerPath: 'devices',
            tagType: 'devices',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                approveDevice: builder.mutation<void, string>({
                    query: (userId) => ({
                        url: `/devices/approve/${userId}`,
                        method: 'POST',
                    }),
                    invalidatesTags: (result, error, userId) => [
                        { type: 'devices', id: 'LIST' },
                        { type: 'devices', id: userId },
                    ],
                }),
                rejectDevice: builder.mutation<void, string>({
                    query: (userId) => ({
                        url: `/devices/reject/${userId}`,
                        method: 'POST',
                    }),
                    invalidatesTags: (result, error, userId) => [
                        { type: 'devices', id: 'LIST' },
                        { type: 'devices', id: userId },
                    ],
                }),
                clearDevice: builder.mutation<void, string>({
                    query: (userId) => ({
                        url: `/devices/${userId}`,
                        method: 'DELETE',
                    }),
                    invalidatesTags: (result, error, userId) => [
                        { type: 'devices', id: 'LIST' },
                        { type: 'devices', id: userId },
                    ],
                }),
            }),
        });
    }
}

export const deviceApi = new DeviceApi().createApi();

export const {
    useGetAllQuery: useGetAllDevicesQuery,
    useApproveDeviceMutation,
    useRejectDeviceMutation,
    useClearDeviceMutation,
} = deviceApi;
