export interface ISmsProvider {
    _id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    parameters: Record<string, any>;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ISmsProviderFormData {
    name: string;
    description?: string;
    active: boolean;
    parameters: Record<string, any>;
}

export interface IUpdateSmsProviderRequest {
    h_id: string;
    data: ISmsProviderFormData;
}
