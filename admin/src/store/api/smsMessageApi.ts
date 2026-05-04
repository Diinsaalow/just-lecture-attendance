import { BaseApi } from "./baseApi";
import { ISmsMessage, IMessageTarget } from "@/types/smsMessage";

class SmsMessageApi extends BaseApi<ISmsMessage> {
    constructor() {
        super('/sms-messages', {
            reducerPath: 'smsMessageApi',
            tagType: 'SmsMessages',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                addTarget: builder.mutation<IMessageTarget, any>({
                    query: ({ id, data }) => ({
                        url: `${this.endpoint}/${id}/targets`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: (result, error, { id }) => [{ type: this.config.tagType, id }],
                }),
                getTargets: builder.query<IMessageTarget[], string>({
                    query: (id) => `${this.endpoint}/${id}/targets`,
                    providesTags: (result, error, id) => [{ type: this.config.tagType, id: `TARGETS_${id}` }],
                }),
                removeTarget: builder.mutation<void, string>({
                    query: (targetId) => ({
                        url: `${this.endpoint}/targets/${targetId}`,
                        method: 'DELETE',
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),
                getRecipientCount: builder.query<{ count: number }, string>({
                    query: (id) => `${this.endpoint}/${id}/recipients/count`,
                }),
                rescheduleSmsMessage: builder.mutation<ISmsMessage, { id: string, data: { scheduledAt: string } }>({
                    query: ({ id, data }) => ({
                        url: `${this.endpoint}/${id}/reschedule`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),
            }),
        });
    }
}

export const smsMessageApi = new SmsMessageApi().createApi();

export const {
    useGetAllQuery: useGetAllSmsMessagesQuery,
    useGetByIdQuery: useGetSmsMessageByIdQuery,
    useCreateMutation: useCreateSmsMessageMutation,
    useUpdateMutation: useUpdateSmsMessageMutation,
    useDeleteMutation: useDeleteSmsMessageMutation,
    useBulkDeleteMutation: useBulkDeleteSmsMessagesMutation,
    useAddTargetMutation: useAddTargetMutation,
    useGetTargetsQuery: useGetTargetsQuery,
    useRemoveTargetMutation: useRemoveTargetMutation,
    useGetRecipientCountQuery: useGetRecipientCountQuery,
    useRescheduleSmsMessageMutation,
} = smsMessageApi;
