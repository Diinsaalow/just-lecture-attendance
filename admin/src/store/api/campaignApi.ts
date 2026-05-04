import { BaseApi } from './baseApi';
import { ICampaign } from '../../types/campaign';

class CampaignApi extends BaseApi<ICampaign> {
    constructor() {
        super('/campaigns', {
            reducerPath: 'campaignApi',
            tagType: 'campaigns',
        });
    }
}

export const campaignApi = new CampaignApi().createApi();

export const {
    useGetAllQuery: useGetAllCampaignsQuery,
    useGetByIdQuery: useGetCampaignByIdQuery,
    useCreateMutation: useCreateCampaignMutation,
    useUpdateMutation: useUpdateCampaignMutation,
    useDeleteMutation: useDeleteCampaignMutation,
    useBulkDeleteMutation: useBulkDeleteCampaignsMutation,
} = campaignApi;
