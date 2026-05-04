import { BaseApi } from './baseApi';
import type { ISmsProvider } from '../../types/sms';

class SmsProviderApi extends BaseApi<ISmsProvider> {
    constructor() {
        super('/sms-providers', {
            reducerPath: 'smsProviderApi',
            tagType: 'smsProviders',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Get list of SMS providers (no pagination)
                getSmsProvidersList: builder.query<ISmsProvider[], void>({
                    query: () => '/sms-providers/list',
                    transformResponse: (response: any) => {
                        // Transform backend data to frontend format
                        return response.map((item: any, index: number) => ({
                            ...item,
                            h_id: index + 1, // Use index as h_id for frontend compatibility
                        }));
                    },
                    providesTags: [{ type: 'smsProviders', id: 'LIST' }],
                }),

                getActiveSmsProviders: builder.query<ISmsProvider[], void>({
                    query: () => '/sms-providers/active',
                    transformResponse: (response: any) => {
                        return response.map((item: any, index: number) => ({
                            ...item,
                            h_id: index + 1,
                        }));
                    },
                    providesTags: [{ type: 'smsProviders', id: 'ACTIVE' }],
                }),

                // Custom endpoint for the frontend form compatibility
                updateSmsProviderForm: builder.mutation<ISmsProvider, { h_id: string; data: any }>({
                    query: ({ h_id, data }) => ({
                        url: `/sms-providers/${h_id}`,
                        method: 'PATCH',
                        body: {
                            status: data.active ? 'active' : 'inactive',
                            parameters: data.parameters,
                        },
                    }),
                    invalidatesTags: (result, error, { h_id }) => [
                        { type: 'smsProviders', id: h_id },
                        { type: 'smsProviders', id: 'LIST' },
                        { type: 'smsProviders', id: 'ACTIVE' },
                    ],
                }),
            }),
        });
    }
}

export const smsProviderApi = new SmsProviderApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllSmsProvidersQuery,
    useGetByIdQuery: useGetSmsProviderByIdQuery,
    useCreateMutation: useCreateSmsProviderMutation,
    useUpdateMutation: useUpdateSmsProviderMutation,
    useDeleteMutation: useDeleteSmsProviderMutation,
    useSearchQuery: useSearchSmsProvidersQuery,
    useBulkDeleteMutation: useBulkDeleteSmsProvidersMutation,
    useBulkStoreMutation: useBulkStoreSmsProvidersMutation,
    useGetSmsProvidersListQuery,
    useGetActiveSmsProvidersQuery,
    useUpdateSmsProviderFormMutation,
} = smsProviderApi;
