import { BaseApi } from './baseApi';
import type { ICourse } from '../../types/course';

class CourseApi extends BaseApi<ICourse> {
    constructor() {
        super('/courses', {
            reducerPath: 'courseApi',
            tagType: 'courses',
        });
    }
}

export const courseApi = new CourseApi().createApi();

export const {
    useGetAllQuery: useGetAllCoursesQuery,
    useGetByIdQuery: useGetCourseByIdQuery,
    useCreateMutation: useCreateCourseMutation,
    useUpdateMutation: useUpdateCourseMutation,
    useDeleteMutation: useDeleteCourseMutation,
    useBulkDeleteMutation: useBulkDeleteCoursesMutation,
} = courseApi;
