import { BaseApi } from './baseApi';
import {
    EnrollmentReportFilter,
    EnrollmentReportResponse,
    OrderReportFilter,
    OrderReportResponse,
    UserReportFilter,
    UserReportResponse,
    PaymentReportFilter,
    PaymentReportResponse,
    CampaignReportFilter,
    CampaignReportResponse,
    SmsReportFilter,
    SmsReportResponse,
    FeedbackReportFilter,
    FeedbackReportResponse,
    RecipientReportFilter,
    RecipientReportResponse
} from '../../types/reports';

// Helper function to format report filter params
const formatReportParams = (params: any) => {
    if (!params) return {};

    const formatted: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // Handle arrays - for single item arrays, send just the value
        // NestJS with @Transform decorator will handle it
        if (Array.isArray(value)) {
            if (value.length === 1) {
                formatted[key] = value[0];
            } else if (value.length > 1) {
                // For multiple values, send as array (will be serialized as key=val1&key=val2)
                formatted[key] = value;
            }
        } else {
            formatted[key] = value;
        }
    });

    return formatted;
};

class ReportsApi extends BaseApi<any> {
    constructor() {
        super('/reports', {
            reducerPath: 'reportApi',
            tagType: 'reports',
        });
    }

    createReportsApi() {
        const api = super.createApi();
        return api.injectEndpoints({
            endpoints: (builder) => ({
                getEnrollmentReport: builder.query<EnrollmentReportResponse, EnrollmentReportFilter | undefined>({
                    query: (params = {} as EnrollmentReportFilter) => ({
                        url: `/reports/enrollments`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'ENROLLMENTS' }],
                }),
                getOrderReport: builder.query<OrderReportResponse, OrderReportFilter | undefined>({
                    query: (params = {} as OrderReportFilter) => ({
                        url: `/reports/orders`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'ORDERS' }],
                }),
                getUserReport: builder.query<UserReportResponse, UserReportFilter | undefined>({
                    query: (params = {} as UserReportFilter) => ({
                        url: `/reports/users`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'USERS' }],
                }),
                getPaymentReport: builder.query<PaymentReportResponse, PaymentReportFilter | undefined>({
                    query: (params = {} as PaymentReportFilter) => ({
                        url: `/reports/payments`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'PAYMENTS' }],
                }),
                getCampaignReport: builder.query<CampaignReportResponse, CampaignReportFilter | undefined>({
                    query: (params = {} as CampaignReportFilter) => ({
                        url: `/reports/campaigns`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'CAMPAIGNS' }],
                }),
                getSmsReport: builder.query<SmsReportResponse, SmsReportFilter | undefined>({
                    query: (params = {} as SmsReportFilter) => ({
                        url: `/reports/sms`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'SMS' }],
                }),
                getFeedbackReport: builder.query<FeedbackReportResponse, FeedbackReportFilter | undefined>({
                    query: (params = {} as FeedbackReportFilter) => ({
                        url: `/reports/feedback`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'FEEDBACK' }],
                }),
                getRecipientReport: builder.query<RecipientReportResponse, RecipientReportFilter | undefined>({
                    query: (params = {} as RecipientReportFilter) => ({
                        url: `/reports/recipients`,
                        method: 'GET',
                        params: formatReportParams(params),
                    }),
                    providesTags: [{ type: 'reports', id: 'RECIPIENTS' }],
                }),
            }),
        });
    }
}

export const reportApi = new ReportsApi().createReportsApi();

export const {
    useGetEnrollmentReportQuery,
    useGetOrderReportQuery,
    useGetUserReportQuery,
    useGetPaymentReportQuery,
    useGetCampaignReportQuery,
    useGetSmsReportQuery,
    useGetFeedbackReportQuery,
    useGetRecipientReportQuery,
    useLazyGetEnrollmentReportQuery,
    useLazyGetOrderReportQuery,
    useLazyGetUserReportQuery,
    useLazyGetPaymentReportQuery,
    useLazyGetCampaignReportQuery,
    useLazyGetSmsReportQuery,
    useLazyGetFeedbackReportQuery,
    useLazyGetRecipientReportQuery,
} = reportApi;


