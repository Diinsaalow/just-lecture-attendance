import { BaseApi } from './baseApi';
import type { IMailConfig, ITestEmailPayload } from '../../types/mail';

class MailConfigApi extends BaseApi<IMailConfig> {
    constructor() {
        super('/mail-config', {
            reducerPath: 'mailConfigApi',
            tagType: 'mailConfigs',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Get the active mail configuration (single config)
                getMailConfig: builder.query<IMailConfig, void>({
                    query: () => ({
                        url: '/mail-config',
                        params: { limit: 1, page: 1 },
                    }),
                    transformResponse: (response: any) => {
                        // Return the first config or null
                        return response.docs?.[0] || null;
                    },
                    providesTags: [{ type: 'mailConfigs', id: 'CONFIG' }],
                }),

                // Update mail configuration
                updateMailConfig: builder.mutation<IMailConfig, { id: string; data: any }>({
                    query: ({ id, data }) => ({
                        url: `/mail-config/${id}`,
                        method: 'PATCH',
                        body: data,
                    }),
                    invalidatesTags: [
                        { type: 'mailConfigs', id: 'CONFIG' },
                        { type: 'mailConfigs', id: 'LIST' },
                    ],
                }),

                // Send test email
                sendTestEmail: builder.mutation<{ success: boolean; message: string }, ITestEmailPayload>({
                    query: (data) => ({
                        url: '/mail-config/test',
                        method: 'POST',
                        body: data,
                    }),
                }),
            }),
        });
    }
}

export const mailConfigApi = new MailConfigApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllMailConfigsQuery,
    useGetByIdQuery: useGetMailConfigByIdQuery,
    useCreateMutation: useCreateMailConfigMutation,
    useUpdateMutation: useUpdateMailConfigMutation,
    useDeleteMutation: useDeleteMailConfigMutation,
    useSearchQuery: useSearchMailConfigsQuery,
    useBulkDeleteMutation: useBulkDeleteMailConfigsMutation,
    useBulkStoreMutation: useBulkStoreMailConfigsMutation,
    useGetMailConfigQuery,
    useSendTestEmailMutation,
} = mailConfigApi;

