import { BaseApi } from './baseApi';
import type { ILectureClass } from '../../types/lectureClass';

class LectureClassApi extends BaseApi<ILectureClass> {
    constructor() {
        super('/classes', {
            reducerPath: 'lectureClassApi',
            tagType: 'lectureClasses',
        });
    }
}

export const lectureClassApi = new LectureClassApi().createApi();

export const {
    useGetAllQuery: useGetAllLectureClassesQuery,
    useGetByIdQuery: useGetLectureClassByIdQuery,
    useCreateMutation: useCreateLectureClassMutation,
    useUpdateMutation: useUpdateLectureClassMutation,
    useDeleteMutation: useDeleteLectureClassMutation,
    useBulkDeleteMutation: useBulkDeleteLectureClassesMutation,
} = lectureClassApi;
