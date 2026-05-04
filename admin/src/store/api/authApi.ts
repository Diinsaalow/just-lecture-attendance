import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ILoginCredentials, IAuthResponse, IUser, ITwoFAStatus } from '../../types/auth';
import { storageUtil } from '../../utils/storage';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = storageUtil.getToken();
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<IAuthResponse, ILoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getUserInfo: builder.query<IUser, void>({
            query: () => '/auth/me',
            providesTags: ['Auth'],
        }),
        refreshToken: builder.mutation<{ accessToken: string }, { userId: string; refreshToken: string }>({
            query: (credentials) => ({
                url: '/auth/refresh',
                method: 'POST',
                body: credentials,
            }),
        }),
        updateProfile: builder.mutation<any, any>({
            query: (profileData) => ({
                url: '/auth/update-user-profile',
                method: 'POST',
                body: profileData,
            }),
            invalidatesTags: ['Auth'],
        }),
        changePassword: builder.mutation<any, any>({
            query: (passwordData) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: passwordData,
            }),
        }),
        updateProfilePicture: builder.mutation<any, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: '/auth/upload-profile-image',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ['Auth'],
        }),

        // 2FA endpoints
        setup2FA: builder.mutation<any, void>({
            query: () => ({
                url: '/auth/2fa/setup',
                method: 'POST',
            }),
        }),
        enable2FA: builder.mutation<any, { token: string }>({
            query: (data) => ({
                url: '/auth/2fa/enable',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        verify2FA: builder.mutation<IAuthResponse, { username: string; token: string }>({
            query: (data) => ({
                url: '/auth/2fa/verify',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        verify2FABackupCode: builder.mutation<IAuthResponse, { username: string; backupCode: string }>({
            query: (data) => ({
                url: '/auth/2fa/verify-backup-code',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        disable2FA: builder.mutation<any, { password: string; token: string }>({
            query: (data) => ({
                url: '/auth/2fa/disable',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Auth'],
        }),
        get2FAStatus: builder.query<ITwoFAStatus, void>({
            query: () => '/auth/2fa/status',
            providesTags: ['Auth'],
        }),
        regenerateBackupCodes: builder.mutation<any, { password: string }>({
            query: (data) => ({
                url: '/auth/2fa/regenerate-backup-codes',
                method: 'POST',
                body: data,
            }),
        }),

        // Session lock endpoints
        lockSession: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/auth/session/lock',
                method: 'POST',
            }),
        }),
        unlockSession: builder.mutation<{ success: boolean; message: string }, { token: string }>({
            query: (data) => ({
                url: '/auth/session/unlock',
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useGetUserInfoQuery,
    useRefreshTokenMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useUpdateProfilePictureMutation,
    useSetup2FAMutation,
    useEnable2FAMutation,
    useVerify2FAMutation,
    useVerify2FABackupCodeMutation,
    useDisable2FAMutation,
    useGet2FAStatusQuery,
    useRegenerateBackupCodesMutation,
    useLockSessionMutation,
    useUnlockSessionMutation,
} = authApi;
