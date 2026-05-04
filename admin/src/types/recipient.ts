export interface IRecipient {
    _id: string;
    phoneNumber: string;
    languageCode: string;
    optInStatus: boolean;
    isActive: boolean;
    groupIds?: string[];
    gender?: string;
    createdAt: string;
    updatedAt: string;
  };