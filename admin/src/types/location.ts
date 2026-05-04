export interface ILocation {
    _id: string;
    country: string;
    region: string;
    district: string;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateLocationRequest {
    country: string;
    region: string;
    district: string;
}

export interface IUpdateLocationRequest extends Partial<ICreateLocationRequest> {
    id: string;
}
