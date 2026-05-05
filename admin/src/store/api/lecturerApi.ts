import { BaseApi } from './baseApi';
import type { IUser } from '../../types/auth';

class LecturerApi extends BaseApi<IUser> {
    constructor() {
        super('/users/lecturers', {
            reducerPath: 'lecturers',
            tagType: 'lecturers',
        });
    }

    createApi() {
        const base = super.createApi();
        return base.injectEndpoints({
            endpoints: (builder) => ({
                previewNextUsername: builder.query<{ username: string }, void>({
                    query: () => ({ url: '/users/lecturers/next-username' }),
                    providesTags: [{ type: 'lecturers', id: 'NEXT_USERNAME' }],
                }),
            }),
        });
    }
}

export const lecturerApi = new LecturerApi().createApi();

export const {
    useGetAllQuery: useGetAllLecturersQuery,
    useGetByIdQuery: useGetLecturerByIdQuery,
    useCreateMutation: useCreateLecturerMutation,
    useUpdateMutation: useUpdateLecturerMutation,
    useDeleteMutation: useDeleteLecturerMutation,
    useBulkDeleteMutation: useBulkDeleteLecturersMutation,
    usePreviewNextUsernameQuery,
} = lecturerApi;
