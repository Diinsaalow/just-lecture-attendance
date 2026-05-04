import { BaseApi } from "./baseApi";
import { IRecipientGroup } from "@/types/recipientGroup";

class RecipientGroupApi extends BaseApi<IRecipientGroup> {
    constructor() {
        super('/recipient-groups', {
            reducerPath: 'recipientGroupApi',
            tagType: 'RecipientGroups',
        });
    }
}

export const recipientGroupApi = new RecipientGroupApi().createApi();

export const {
    useGetAllQuery: useGetAllRecipientGroupsQuery,
    useGetByIdQuery: useGetRecipientGroupByIdQuery,
    useCreateMutation: useCreateRecipientGroupMutation,
    useUpdateMutation: useUpdateRecipientGroupMutation,
    useDeleteMutation: useDeleteRecipientGroupMutation,
    useBulkDeleteMutation: useBulkDeleteRecipientGroupsMutation,
} = recipientGroupApi;
