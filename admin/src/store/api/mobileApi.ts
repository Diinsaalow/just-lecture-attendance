import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithToken } from './baseQuery';
import type { IMobileConfig, IMobileConfigPayload } from '../../types/mobile';

type BackendVersion = {
    _id: string;
    title: string;
    message: string;
    iosVersion?: string;
    androidVersion?: string;
    iosUrl?: string;
    androidUrl?: string;
    iosForceUpdate?: boolean;
    androidForceUpdate?: boolean;
    firebaseTopic?: string;
    paymentSupport?: 'offline' | 'online' | 'both';
    isActive?: boolean;
};

const mapFromBackend = (doc: BackendVersion | null): IMobileConfig | null => {
    if (!doc) return null;
    return {
        id: doc._id,
        title: doc.title || '',
        message: doc.message || '',
        ios_version: doc.iosVersion || '',
        android_version: doc.androidVersion || '',
        ios_url: doc.iosUrl || '',
        android_url: doc.androidUrl || '',
        ios_force_update: !!doc.iosForceUpdate,
        android_force_update: !!doc.androidForceUpdate,
        firebase_topic: doc.firebaseTopic || '',
        payment_support: (doc.paymentSupport as any) || 'offline',
    };
};

const mapToBackend = (payload: IMobileConfigPayload): Partial<BackendVersion> => ({
    title: payload.title,
    message: payload.message,
    iosVersion: payload.ios_version,
    androidVersion: payload.android_version,
    iosUrl: payload.ios_url,
    androidUrl: payload.android_url,
    iosForceUpdate: payload.ios_force_update,
    androidForceUpdate: payload.android_force_update,
    firebaseTopic: payload.firebase_topic,
    paymentSupport: payload.payment_support,
    isActive: true,
});

export const mobileApi = createApi({
    reducerPath: 'mobileApi',
    baseQuery: baseQueryWithToken,
    tagTypes: ['mobileConfig'],
    endpoints: (builder) => ({
        getActive: builder.query<IMobileConfig | null, void>({
            query: () => ({ url: '/app-versions/active' }),
            transformResponse: (response: BackendVersion | null) => mapFromBackend(response),
            providesTags: (result) => [{ type: 'mobileConfig', id: 'ACTIVE' }],
        }),

        upsert: builder.mutation<IMobileConfig, IMobileConfigPayload>({
            query: (data) => {
                const body = mapToBackend(data);
                // Always use PATCH to update the existing active record
                return { url: '/app-versions/active', method: 'PATCH', body };
            },
            transformResponse: (response: BackendVersion) => mapFromBackend(response)!,
            invalidatesTags: [{ type: 'mobileConfig', id: 'ACTIVE' }],
        }),
    }),
});

export const { useGetActiveQuery, useUpsertMutation } = mobileApi;
