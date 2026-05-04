import { BaseApi } from './baseApi';
import type { IQuiz, CreateQuizDto, UpdateQuizDto, IQuestion, CreateQuestionDto } from '../../types/quiz';

class QuizApi extends BaseApi<IQuiz> {
    constructor() {
        super('/quizzes', {
            reducerPath: 'quizApi',
            tagType: 'quizzes',
        });
    }

    createApi() {
        const baseApi = super.createApi();
        return baseApi.injectEndpoints({
            endpoints: (builder) => ({
                // Subject-level list
                getSubjectQuizzes: builder.query<IQuiz[], string>({
                    query: (subjectId) => `quizzes/subject/${subjectId}`,
                    providesTags: ['quizzes'],
                }),
                // Chapter-level list
                getChapterQuizzes: builder.query<IQuiz[], string>({
                    query: (chapterId) => `quizzes/chapter/${chapterId}`,
                    providesTags: ['quizzes'],
                }),
                // Lesson-level list
                getLessonQuizzes: builder.query<IQuiz[], string>({
                    query: (lessonId) => `quizzes/lesson/${lessonId}`,
                    providesTags: ['quizzes'],
                }),

                // Create & update quiz
                createQuiz: builder.mutation<IQuiz, CreateQuizDto>({
                    query: (data) => ({ url: '/quizzes', method: 'POST', body: data }),
                    invalidatesTags: ['quizzes', 'subjects'],
                }),
                updateQuiz: builder.mutation<IQuiz, { id: string; data: UpdateQuizDto }>({
                    query: ({ id, data }) => ({ url: `/quizzes/${id}`, method: 'PATCH', body: data }),
                    invalidatesTags: (r, e, { id }) => [{ type: 'quizzes', id }, { type: 'quizzes', id: 'LIST' }, 'subjects'],
                }),
                deleteQuiz: builder.mutation<{ success: boolean }, string>({
                    query: (id) => ({ url: `/quizzes/${id}`, method: 'DELETE' }),
                    invalidatesTags: ['quizzes', 'subjects'],
                }),

                // Manage questions
                addQuestion: builder.mutation<IQuiz, { quizId: string; question: CreateQuestionDto }>({
                    query: ({ quizId, question }) => ({ url: `/quizzes/${quizId}/question`, method: 'POST', body: question }),
                    invalidatesTags: (result, error, { quizId }) => [{ type: 'quizzes', id: quizId }, { type: 'quizzes', id: 'LIST' }, 'quizzes'],
                }),
                updateQuestion: builder.mutation<IQuiz, { quizId: string; questionId: string; question: Partial<CreateQuestionDto> }>({
                    query: ({ quizId, questionId, question }) => ({ url: `/quizzes/${quizId}/question/${questionId}`, method: 'PATCH', body: question }),
                    invalidatesTags: (result, error, { quizId }) => [{ type: 'quizzes', id: quizId }, { type: 'quizzes', id: 'LIST' }, 'quizzes'],
                }),
                removeQuestion: builder.mutation<IQuiz, { quizId: string; questionId: string }>({
                    query: ({ quizId, questionId }) => ({ url: `/quizzes/${quizId}/question/${questionId}`, method: 'DELETE' }),
                    invalidatesTags: (result, error, { quizId }) => [{ type: 'quizzes', id: quizId }, { type: 'quizzes', id: 'LIST' }, 'quizzes'],
                }),

                // Reorder quizzes
                reorderQuizzes: builder.mutation<{ success: boolean }, { quizzes: Array<{ id: string; order: number }> }>({
                    query: (data) => ({ url: '/quizzes/reorder', method: 'POST', body: data }),
                    invalidatesTags: ['quizzes', 'subjects'],
                }),
            }),
        });
    }
}

export const quizApi = new QuizApi().createApi();

export const {
    useGetAllQuery: useGetAllQuizzesQuery,
    useGetByIdQuery: useGetQuizByIdQuery,
    useCreateQuizMutation,
    useUpdateQuizMutation,
    useDeleteQuizMutation,
    useSearchQuery: useSearchQuizzesQuery,
    useBulkDeleteMutation: useBulkDeleteQuizzesMutation,
    useBulkStoreMutation: useBulkStoreQuizzesMutation,
    useGetSubjectQuizzesQuery,
    useGetChapterQuizzesQuery,
    useGetLessonQuizzesQuery,
    useAddQuestionMutation,
    useUpdateQuestionMutation,
    useRemoveQuestionMutation,
    useReorderQuizzesMutation,
} = quizApi;
