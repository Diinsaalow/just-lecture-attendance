import { BaseApi } from './baseApi';
import type {
    IAbsenceSubmission,
    ICreateSubmissionDto,
    IReviewSubmissionDto,
} from '../../types/submission';

class SubmissionApi extends BaseApi<IAbsenceSubmission> {
    constructor() {
        super('/submissions', {
            reducerPath: 'submissionApi',
            tagType: 'submissions',
        });
    }

    createApi() {
        const base = super.createApi();
        return base.injectEndpoints({
            endpoints: (builder) => ({
                createSubmission: builder.mutation<IAbsenceSubmission, ICreateSubmissionDto>({
                    query: (data) => ({
                        url: `/submissions`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: [{ type: 'submissions', id: 'LIST' }],
                }),
                approveSubmission: builder.mutation<
                    IAbsenceSubmission,
                    { id: string; data: IReviewSubmissionDto }
                >({
                    query: ({ id, data }) => ({
                        url: `/submissions/${id}/approve`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: (_result, _error, { id }) => [
                        { type: 'submissions', id },
                        { type: 'submissions', id: 'LIST' },
                    ],
                }),
                rejectSubmission: builder.mutation<
                    IAbsenceSubmission,
                    { id: string; data: IReviewSubmissionDto }
                >({
                    query: ({ id, data }) => ({
                        url: `/submissions/${id}/reject`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: (_result, _error, { id }) => [
                        { type: 'submissions', id },
                        { type: 'submissions', id: 'LIST' },
                    ],
                }),
            }),
        });
    }
}

export const submissionApi = new SubmissionApi().createApi();

export const {
    useGetAllQuery: useGetAllSubmissionsQuery,
    useGetByIdQuery: useGetSubmissionByIdQuery,
    useCreateSubmissionMutation,
    useApproveSubmissionMutation,
    useRejectSubmissionMutation,
} = submissionApi;
