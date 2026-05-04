export interface ICampaign {
    _id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    targetAudienceSize: number;
    status: 'active' | 'inactive' | 'paused' | 'completed';
    createdAt: string;
    updatedAt: string;
}

export interface ICreateCampaignRequest {
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    targetAudienceSize: number;
    status: 'active' | 'inactive' | 'paused' | 'completed';
}

export interface IUpdateCampaignRequest extends Partial<ICreateCampaignRequest> {
    id: string;
}
