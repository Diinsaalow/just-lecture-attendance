import type { IPlan } from '../../types/plan';
import { BaseApi } from './baseApi';

class PlansApi extends BaseApi<IPlan> {
    constructor() {
        super('/plans', {
            reducerPath: 'plans',
            tagType: 'plans',
        });
    }

    createPlansApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                changeStatus: builder.mutation<IPlan, { id: string; status: 'active' | 'inactive' | 'archived' }>({
                    query: ({ id, status }) => ({
                        url: `/plans/${id}/status`,
                        method: 'PATCH',
                        body: { status },
                    }),
                    invalidatesTags: (result, error, { id }) => [
                        { type: 'plans', id },
                        { type: 'plans', id: 'LIST' },
                    ],
                }),

                getActivePlans: builder.query<any, any>({
                    query: (params) => ({
                        url: '/plans/active',
                        params,
                    }),
                    providesTags: [{ type: 'plans', id: 'ACTIVE' }],
                }),

                getPlanWithDetails: builder.query<IPlan, string>({
                    query: (id) => `/plans/${id}/details`,
                    providesTags: (result, error, id) => [{ type: 'plans', id }],
                }),
            }),
        });
    }
}

export const plansApi = new PlansApi().createPlansApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllPlansQuery,
    useGetByIdQuery: useGetPlanByIdQuery,
    useCreateMutation: useCreatePlanMutation,
    useUpdateMutation: useUpdatePlanMutation,
    useDeleteMutation: useDeletePlanMutation,
    useSearchQuery: useSearchPlansQuery,
    useBulkDeleteMutation: useBulkDeletePlansMutation,
    useBulkStoreMutation: useBulkStorePlansMutation,
    useChangeStatusMutation: useChangePlanStatusMutation,
    useGetActivePlansQuery: useGetActivePlansQuery,
    useGetPlanWithDetailsQuery: useGetPlanWithDetailsQuery,
} = plansApi;
