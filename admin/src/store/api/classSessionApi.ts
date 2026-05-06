import { BaseApi } from './baseApi';
import type { IClassSession } from '../../types/classSession';

class ClassSessionApi extends BaseApi<IClassSession> {
    constructor() {
        super('/class-sessions', {
            reducerPath: 'classSessionApi',
            tagType: 'classSessions',
        });
    }

    createApi() {
        const endpoint = this.endpoint;
        const tagType = this.config.tagType;
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                generateClassSessions: builder.mutation<
                    { upserted: number; matchedExisting: number },
                    { semesterId: string; classId?: string }
                >({
                    query: (body) => ({
                        url: `${endpoint}/generate`,
                        method: 'POST',
                        body,
                    }),
                    invalidatesTags: [{ type: tagType, id: 'LIST' }],
                }),
                classesForGeneration: builder.query<Array<{ _id: string; name: string }>, void>({
                    query: () => ({ url: `${endpoint}/classes-for-generation` }),
                }),
                semestersForGeneration: builder.query<Array<{ _id: string; name: string }>, string>({
                    query: (classId) => ({
                        url: `${endpoint}/semesters-for-generation`,
                        params: { classId },
                    }),
                }),
            }),
            overrideExisting: true,
        });
    }
}

export const classSessionApi = new ClassSessionApi().createApi();

export const {
    useGetAllQuery: useGetAllClassSessionsQuery,
    useGetByIdQuery: useGetClassSessionByIdQuery,
    useUpdateMutation: useUpdateClassSessionMutation,
    useGenerateClassSessionsMutation,
    useClassesForGenerationQuery,
    useSemestersForGenerationQuery,
} = classSessionApi;
