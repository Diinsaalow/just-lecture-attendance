import { BaseApi } from './baseApi';
import type { IChapter } from '../../types/chapter';

class ChapterApi extends BaseApi<IChapter> {
    constructor() {
        super('/chapters', {
            reducerPath: 'chapterApi',
            tagType: 'chapters',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                getChaptersBySubject: builder.query<IChapter[], string>({
                    query: (subjectId) => `/subject/${subjectId}`,
                    providesTags: ['chapters'],
                }),
                reorderChapters: builder.mutation<{ success: boolean }, { chapters: Array<{ id: string; order: number }> }>({
                    query: (data) => ({
                        url: 'chapters/reorder',
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: ['chapters'],
                }),
            }),
        });
    }
}

export const chapterApi = new ChapterApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllChaptersQuery,
    useGetByIdQuery: useGetChapterQuery,
    useCreateMutation: useCreateChapterMutation,
    useUpdateMutation: useUpdateChapterMutation,
    useDeleteMutation: useDeleteChapterMutation,
    useSearchQuery: useSearchChaptersQuery,
    useBulkDeleteMutation: useBulkDeleteChaptersMutation,
    useBulkStoreMutation: useBulkStoreChaptersMutation,
    useReorderChaptersMutation,
} = chapterApi;
