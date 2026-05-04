import { BaseApi } from './baseApi';
import type { IPaymentMethod } from '../../types/payment';

class PaymentMethodApi extends BaseApi<IPaymentMethod> {
    constructor() {
        super('/payment-methods', {
            reducerPath: 'paymentMethodApi',
            tagType: 'paymentMethods',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Get list of payment methods (no pagination)
                getPaymentMethodsList: builder.query<IPaymentMethod[], void>({
                    query: () => '/payment-methods/list',
                    transformResponse: (response: any) => {
                        // Transform backend data to frontend format
                        return response.map((item: any, index: number) => ({
                            ...item,
                            h_id: index + 1, // Use index as h_id for frontend compatibility
                        }));
                    },
                    providesTags: [{ type: 'paymentMethods', id: 'LIST' }],
                }),

                getActivePaymentMethods: builder.query<IPaymentMethod[], void>({
                    query: () => '/payment-methods/active',
                    transformResponse: (response: any) => {
                        return response.map((item: any, index: number) => ({
                            ...item,
                            h_id: index + 1,
                        }));
                    },
                    providesTags: [{ type: 'paymentMethods', id: 'ACTIVE' }],
                }),

                getPaymentMethodsByType: builder.query<IPaymentMethod[], { type: string; isAdmin?: boolean }>({
                    query: ({ type, isAdmin = false }) => ({
                        url: `/payment-methods/type/${type}`,
                        params: { isAdmin },
                    }),
                    transformResponse: (response: any) => {
                        return response.map((item: any, index: number) => ({
                            ...item,
                            h_id: index + 1,
                        }));
                    },
                    providesTags: (result, error, { type }) => [{ type: 'paymentMethods', id: `TYPE_${type}` }],
                }),

                // Custom endpoint for the frontend form compatibility
                updatePaymentMethodForm: builder.mutation<IPaymentMethod, { h_id: string; data: any }>({
                    query: ({ h_id, data }) => ({
                        url: `/payment-methods/${h_id}`,
                        method: 'PATCH',
                        body: {
                            name: data.name,
                            description: data.description,
                            status: data.active ? 'active' : 'inactive',
                            parameters: data.parameters,
                        },
                    }),
                    invalidatesTags: (result, error, { h_id }) => [
                        { type: 'paymentMethods', id: h_id },
                        { type: 'paymentMethods', id: 'LIST' },
                        { type: 'paymentMethods', id: 'ACTIVE' },
                    ],
                }),
            }),
        });
    }
}

export const paymentMethodApi = new PaymentMethodApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllPaymentMethodsQuery,
    useGetByIdQuery: useGetPaymentMethodByIdQuery,
    useCreateMutation: useCreatePaymentMethodMutation,
    useUpdateMutation: useUpdatePaymentMethodMutation,
    useDeleteMutation: useDeletePaymentMethodMutation,
    useSearchQuery: useSearchPaymentMethodsQuery,
    useBulkDeleteMutation: useBulkDeletePaymentMethodsMutation,
    useBulkStoreMutation: useBulkStorePaymentMethodsMutation,
    useGetPaymentMethodsListQuery,
    useGetActivePaymentMethodsQuery,
    useGetPaymentMethodsByTypeQuery,
    useUpdatePaymentMethodFormMutation,
} = paymentMethodApi;
