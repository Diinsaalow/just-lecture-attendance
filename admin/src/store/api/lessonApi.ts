import { BaseApi } from './baseApi';
import type { ILesson } from '../../types/lesson';

class LessonApi extends BaseApi<ILesson> {
    constructor() {
        super('/lessons', {
            reducerPath: 'lessonApi',
            tagType: 'lessons',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                getLessonsByChapter: builder.query<ILesson[], string>({
                    query: (chapterId) => `/chapter/${chapterId}`,
                    providesTags: ['lessons'],
                }),
                getFreeLessons: builder.query<ILesson[], void>({
                    query: () => '/free',
                    providesTags: ['lessons'],
                }),
                incrementLessonViews: builder.mutation<{ success: boolean }, string>({
                    query: (id) => ({
                        url: `/${id}/view`,
                        method: 'POST',
                    }),
                }),
                incrementLessonDownloads: builder.mutation<{ success: boolean }, string>({
                    query: (id) => ({
                        url: `/${id}/download`,
                        method: 'POST',
                    }),
                }),
                reorderLessons: builder.mutation<{ success: boolean }, { lessons: Array<{ id: string; order: number; chapterId?: string }> }>({
                    query: (data) => ({
                        url: 'lessons/reorder',
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: ['lessons'],
                }),
            }),
        });
    }
}

export const lessonApi = new LessonApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllLessonsQuery,
    useGetByIdQuery: useGetLessonQuery,
    useCreateMutation: useCreateLessonMutation,
    useUpdateMutation: useUpdateLessonMutation,
    useDeleteMutation: useDeleteLessonMutation,
    useSearchQuery: useSearchLessonsQuery,
    useBulkDeleteMutation: useBulkDeleteLessonsMutation,
    useBulkStoreMutation: useBulkStoreLessonsMutation,
    useReorderLessonsMutation,
} = lessonApi;
