export type PaymentSupport = 'offline' | 'online' | 'both';

export interface IMobileConfig {
    id?: string;
    title: string;
    message: string;
    ios_version: string;
    android_version: string;
    ios_url: string;
    android_url: string;
    ios_force_update: boolean;
    android_force_update: boolean;
    firebase_topic: string;
    payment_support: PaymentSupport;
}

export type IMobileConfigPayload = IMobileConfig;
