import { BaseApi } from './baseApi';
import type { IHall } from '../../types/hall';

class HallApi extends BaseApi<IHall> {
    constructor() {
        super('/halls', {
            reducerPath: 'hallApi',
            tagType: 'halls',
        });
    }

    createApi() {
        const base = super.createApi();
        return base.injectEndpoints({
            endpoints: (builder) => ({
                regenerateHallQr: builder.mutation<IHall, string>({
                    query: (id) => ({
                        url: `/halls/${id}/qr/regenerate`,
                        method: 'POST',
                    }),
                    invalidatesTags: (result, error, id) => [{ type: 'halls', id }],
                }),
            }),
        });
    }
}

export const hallApi = new HallApi().createApi();

export const {
    useGetAllQuery: useGetAllHallsQuery,
    useGetByIdQuery: useGetHallByIdQuery,
    useCreateMutation: useCreateHallMutation,
    useUpdateMutation: useUpdateHallMutation,
    useDeleteMutation: useDeleteHallMutation,
    useBulkDeleteMutation: useBulkDeleteHallsMutation,
    useRegenerateHallQrMutation,
} = hallApi;
