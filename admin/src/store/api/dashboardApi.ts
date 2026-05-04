import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithToken } from './baseQuery';
import {
    SystemStatus,
    ChartData,
    UserDistribution,
    RecentUser,
    SmsStatus,
    RecentCampaign,
    RecentFeedback,
    DeliveryTrends,
} from '../../types/dashboard';

export const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: baseQueryWithToken,
    tagTypes: ['Dashboard'],
    endpoints: (builder) => ({
        // System Dashboard endpoints
        getSystemStatus: builder.query<SystemStatus, void>({
            query: () => '/dashboard/system/status',
            providesTags: [{ type: 'Dashboard', id: 'system-status' }],
        }),

        getUserGrowth: builder.query<ChartData, void>({
            query: () => '/dashboard/system/growth',
            providesTags: [{ type: 'Dashboard', id: 'user-growth' }],
        }),

        getUserDistribution: builder.query<UserDistribution, void>({
            query: () => '/dashboard/system/distribution',
            providesTags: [{ type: 'Dashboard', id: 'user-distribution' }],
        }),

        getRecentUsers: builder.query<RecentUser[], void>({
            query: () => '/dashboard/system/recent-users',
            providesTags: [{ type: 'Dashboard', id: 'recent-users' }],
        }),

        // SMS Dashboard endpoints
        getSmsStatus: builder.query<SmsStatus, void>({
            query: () => '/dashboard/sms/status',
            providesTags: [{ type: 'Dashboard', id: 'sms-status' }],
        }),

        getCampaignTrends: builder.query<ChartData, void>({
            query: () => '/dashboard/sms/campaign-trends',
            providesTags: [{ type: 'Dashboard', id: 'campaign-trends' }],
        }),

        getMessageTrends: builder.query<ChartData, void>({
            query: () => '/dashboard/sms/message-trends',
            providesTags: [{ type: 'Dashboard', id: 'message-trends' }],
        }),

        getFeedbackDistribution: builder.query<UserDistribution, void>({
            query: () => '/dashboard/sms/feedback-distribution',
            providesTags: [{ type: 'Dashboard', id: 'feedback-distribution' }],
        }),

        getDeliveryDistribution: builder.query<UserDistribution, void>({
            query: () => '/dashboard/sms/delivery-distribution',
            providesTags: [{ type: 'Dashboard', id: 'delivery-distribution' }],
        }),

        getRecentCampaigns: builder.query<RecentCampaign[], void>({
            query: () => '/dashboard/sms/recent-campaigns',
            providesTags: [{ type: 'Dashboard', id: 'recent-campaigns' }],
        }),

        getRecentFeedback: builder.query<RecentFeedback[], void>({
            query: () => '/dashboard/sms/recent-feedback',
            providesTags: [{ type: 'Dashboard', id: 'recent-feedback' }],
        }),
        getDeliveryTrends: builder.query<DeliveryTrends, void>({
            query: () => '/dashboard/sms/delivery-trends',
            providesTags: [{ type: 'Dashboard', id: 'delivery-trends' }],
        }),
        getFeedbackTrends: builder.query<ChartData, void>({
            query: () => '/dashboard/sms/feedback-trends',
            providesTags: [{ type: 'Dashboard', id: 'feedback-trends' }],
        }),
    }),
});

export const {
    useGetSystemStatusQuery,
    useGetUserGrowthQuery,
    useGetUserDistributionQuery,
    useGetRecentUsersQuery,
    useGetSmsStatusQuery,
    useGetCampaignTrendsQuery,
    useGetMessageTrendsQuery,
    useGetFeedbackDistributionQuery,
    useGetDeliveryDistributionQuery,
    useGetRecentCampaignsQuery,
    useGetRecentFeedbackQuery,
    useGetDeliveryTrendsQuery,
    useGetFeedbackTrendsQuery,
} = dashboardApi;
