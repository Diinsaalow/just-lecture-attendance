import { BaseApi } from './baseApi';
import type { IOrder, IOrderStatistics, IBulkDeleteOrderResponse } from '../../types/order';

class OrderApi extends BaseApi<IOrder> {
    constructor() {
        super('/orders', {
            reducerPath: 'orderApi',
            tagType: 'orders',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Statistics
                getOrderStatistics: builder.query<IOrderStatistics, string>({
                    query: (curriculum: string) => `/orders/statistics?curriculum=${curriculum}`,
                    providesTags: ['orderStatistics' as any],
                }),

                // Send to processing
                sendOrderToProcessing: builder.mutation<any, string>({
                    query: (orderId) => ({
                        url: `/orders/${orderId}/send-to-processing`,
                        method: 'PATCH',
                    }),
                    invalidatesTags: ['orders' as any, 'orderStatistics' as any],
                }),

                // Cancel order
                cancelOrder: builder.mutation<any, { orderId: string; reason?: string }>({
                    query: ({ orderId, reason }) => ({
                        url: `/orders/${orderId}/cancel`,
                        method: 'PATCH',
                        body: { reason },
                    }),
                    invalidatesTags: ['orders' as any, 'orderStatistics' as any],
                }),

                // Pay order
                payOrder: builder.mutation<any, { orderId: string; paymentData: any }>({
                    query: ({ orderId, paymentData }) => ({
                        url: `/orders/${orderId}/pay`,
                        method: 'POST',
                        body: paymentData,
                    }),
                    invalidatesTags: ['orders' as any, 'orderStatistics' as any],
                }),

                // Complete order
                completeOrder: builder.mutation<any, { orderId: string; sendNotice?: boolean }>({
                    query: ({ orderId, sendNotice = true }) => ({
                        url: `/orders/${orderId}/complete`,
                        method: 'POST',
                        body: { sendNotice },
                    }),
                    invalidatesTags: ['orders' as any, 'orderStatistics' as any, 'enrollments' as any, 'enrollments' as any],
                }),

                // Assign
                assignOrder: builder.mutation<any, { orderId: string; assignedTo: string }>({
                    query: ({ orderId, assignedTo }) => ({
                        url: `/orders/${orderId}/assign`,
                        method: 'PATCH',
                        body: { assignedTo },
                    }),
                    invalidatesTags: ['orders' as any],
                }),

                // Export orders
                exportOrders: builder.mutation<Blob, { curriculum?: string; status?: string }>({
                    query: ({ curriculum, status }) => {
                        const params = new URLSearchParams();
                        if (curriculum) params.append('curriculum', curriculum);
                        if (status) params.append('status', status);
                        return {
                            url: `/orders/export?${params.toString()}`,
                            responseHandler: async (response) => await response.blob(),
                        };
                    },
                }),

                // Override bulk delete to correct response
                bulkDeleteOrders: builder.mutation<IBulkDeleteOrderResponse, { ids: string[] }>({
                    query: (data) => ({
                        url: '/orders/bulk/delete',
                        method: 'DELETE',
                        body: data,
                    }),
                    invalidatesTags: ['orders' as any, 'orderStatistics' as any],
                }),
            }),
            overrideExisting: false,
        });
    }
}

export const orderApi = new OrderApi().createApi();

export const {
    useGetAllQuery: useGetAllOrdersQuery,
    useGetByIdQuery: useGetOrderByIdQuery,
    useCreateMutation: useCreateOrderMutation,
    useUpdateMutation: useUpdateOrderMutation,
    useDeleteMutation: useDeleteOrderMutation,
    useSearchQuery: useSearchOrdersQuery,
    useBulkDeleteMutation,
    useBulkStoreMutation: useBulkStoreOrdersMutation,
    useGetOrderStatisticsQuery,
    useSendOrderToProcessingMutation,
    useCancelOrderMutation,
    usePayOrderMutation,
    useCompleteOrderMutation,
    useAssignOrderMutation,
    useExportOrdersMutation,
    useBulkDeleteOrdersMutation,
} = orderApi;
