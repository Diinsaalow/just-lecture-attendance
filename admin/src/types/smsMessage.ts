import { ILocation } from "./location";
import { IRecipientGroup } from "./recipientGroup";
import { IRecipient } from "./recipient";

export enum SmsMessageType {
    EDUCATION = 'education',
    REMINDER = 'reminder',
    POLL = 'poll',
    QUIZ = 'quiz',
}

export interface ISmsMessage {
    _id: string;
    campaign: string | { _id: string; name: string }; // ID or populated object
    content: string;
    messageType: SmsMessageType;
    scheduledAt?: string;
    sentAt?: string;
    status: 'pending' | 'sent' | 'failed';
    isProcessed: boolean;
    recipientCount: number;
    failureReason?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IMessageTarget {
    _id: string;
    smsMessage: string;
    locations: string[] | ILocation[]; // IDs or populated
    groups: string[] | IRecipientGroup[]; // IDs or populated
    recipients: string[] | IRecipient[]; // IDs or populated
    onlyOptedIn: boolean;
    onlyActive: boolean;
    targetAll: boolean;
    createdAt: string;
    updatedAt: string;
}
