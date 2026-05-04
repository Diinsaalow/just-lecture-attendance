import { BaseApi } from "./baseApi"
import { IRecipient } from "@/types/recipient"


class RecipientApi extends BaseApi<IRecipient> {
    constructor() {
        super('/recipients', {
            reducerPath: 'recipientApi',
            tagType: 'recipients',
        });
    }
}

export const recipientApi = new RecipientApi().createApi();


export const {
    useGetAllQuery: useGetAllRecipientsQuery,
    useGetByIdQuery: useGetRecipientByIdQuery,
    useCreateMutation: useCreateRecipientMutation,
    useUpdateMutation: useUpdateRecipientMutation,
    useDeleteMutation: useDeleteRecipientMutation,
    useBulkDeleteMutation: useBulkDeleteRecipientsMutation,
} = recipientApi;