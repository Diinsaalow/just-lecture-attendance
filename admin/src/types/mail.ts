export interface IMailConfig {
    _id: string;
    name: string;
    fromName: string;
    fromEmail: string;
    host: string;
    port: number;
    user: string;
    password?: string;
    secure: boolean;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IMailConfigPayload {
    name?: string;
    fromName?: string;
    fromEmail?: string;
    host?: string;
    port?: number | string;
    user?: string;
    password?: string;
    secure?: boolean;
    isActive?: boolean;
}

export interface ITestEmailPayload {
    mailConfigId: string;
    toEmail: string;
}
