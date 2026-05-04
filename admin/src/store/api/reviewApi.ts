import { BaseApi } from './baseApi';
import type { IReview, IReviewStatistics } from '../../types/review';

class ReviewApi extends BaseApi<IReview> {
    constructor() {
        super('/reviews', {
            reducerPath: 'reviewApi',
            tagType: 'reviews',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Statistics
                getReviewStatistics: builder.query<IReviewStatistics, string>({
                    query: (curriculum: string) => `/reviews/statistics?curriculum=${curriculum}`,
                    providesTags: ['reviewStatistics' as any],
                }),

                // Toggle review status (visible/invisible)
                toggleReviewStatus: builder.mutation<any, string>({
                    query: (reviewId) => ({
                        url: `/reviews/${reviewId}/toggle-status`,
                        method: 'POST',
                    }),
                    invalidatesTags: ['reviews' as any, 'reviewStatistics' as any],
                }),
            }),
            overrideExisting: false,
        });
    }
}

export const reviewApi = new ReviewApi().createApi();

export const {
    useGetAllQuery: useGetAllReviewsQuery,
    useGetByIdQuery: useGetReviewByIdQuery,
    useCreateMutation: useCreateReviewMutation,
    useUpdateMutation: useUpdateReviewMutation,
    useDeleteMutation: useDeleteReviewMutation,
    useSearchQuery: useSearchReviewsQuery,
    useBulkDeleteMutation,
    useBulkStoreMutation: useBulkStoreReviewsMutation,
    useGetReviewStatisticsQuery,
    useToggleReviewStatusMutation,
} = reviewApi;
