export interface ILoginCredentials {
    username: string;
    passcode: string;
}

export interface IAbilityRule {
    action: string | string[];
    subject: string;
    fields?: string[];
    condition?: {
        own?: boolean;
        [key: string]: any;
    };
}

export type AvailablePermission = {
    action: string | string[];
    subject: string;
    condition?: {
        own?: boolean;
        [key: string]: any;
    };
};

export type FlattenedPermission = {
    id: string;
    name: string; // e.g. "read User", "read (own) User"
    action: 'read' | 'create' | 'update' | 'delete' | 'manage';
    subject: string; // e.g. 'User'
    condition?: {
        own?: boolean;
        [key: string]: any;
    };
};

export interface IRole {
    _id: string;
    name: string;
    ability: IAbilityRule[];
    status?: 'active' | 'inactive' | 'suspended';
    isDeletable?: boolean;
    createdBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    // Some backends also mirror _id into id
    id?: string;
}

export interface IUser {
    _id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    address?: string;
    profileImage?: string;
    skills?: string[];
    socialLinks?: Array<{ platform: string; url: string }>;
    role: string | IRole;
    /** From GET /auth/me or login — CASL rules when provided by API. */
    abilities?: IAbilityRule[];
    facultyId?: string;
    isEmailVerified: boolean;
    // Backend uses string status: 'active' | 'inactive' | 'suspended'
    status?: 'active' | 'inactive' | 'suspended';
    // Kept for backward compatibility where older code might still reference it
    isActive?: boolean;
    referralCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IAuthResponse {
    accessToken: string;
    refreshToken?: string;
    user:
        | IUser
        | {
              id: string;
              username: string;
              role: string;
              abilities?: IAbilityRule[];
              facultyId?: string;
          };
    message?: string;
    requires2FA?: boolean;
}

export interface IApiError {
    message: string;
    statusCode: number;
    error?: string;
}

// New interfaces for the updated auth slice
export interface AuthState {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLocked: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginMutationResponse {
    user: IUser;
    token: string;
}

// 2FA types
export interface ITwoFAStatus {
    enabled: boolean;
    backupCodesCount?: number;
}
