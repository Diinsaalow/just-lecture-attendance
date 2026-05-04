import { IRecipient } from './recipient';

export interface IRecipientGroup {
    _id: string;
    name: string;
    description?: string;
    recipients: string[] | IRecipient[]; // Array of Recipient IDs or Recipient objects depending on populate
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
