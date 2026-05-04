import { BaseApi } from './baseApi';
import type { IPayment, IPaymentStatistics } from '../../types/payment';

class PaymentApi extends BaseApi<IPayment> {
    constructor() {
        super('/payments', {
            reducerPath: 'paymentApi',
            tagType: 'payments',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Statistics
                getPaymentStatistics: builder.query<IPaymentStatistics, string>({
                    query: (curriculum: string) => `/payments/statistics?curriculum=${curriculum}`,
                    providesTags: ['paymentStatistics' as any],
                }),

                // Export payments
                exportPayments: builder.mutation<Blob, { curriculum?: string }>({
                    query: ({ curriculum }) => {
                        const params = new URLSearchParams();
                        if (curriculum) params.append('curriculum', curriculum);
                        return {
                            url: `/payments/export?${params.toString()}`,
                            responseHandler: async (response) => await response.blob(),
                        };
                    },
                }),
            }),
            overrideExisting: false,
        });
    }
}

export const paymentApi = new PaymentApi().createApi();

export const {
    useGetAllQuery: useGetAllPaymentsQuery,
    useGetByIdQuery: useGetPaymentByIdQuery,
    useSearchQuery: useSearchPaymentsQuery,
    useGetPaymentStatisticsQuery,
    useExportPaymentsMutation,
} = paymentApi;
