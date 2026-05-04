import { BaseApi } from './baseApi';
import type { IUser } from '../../types/auth';

class UserApi extends BaseApi<IUser> {
    constructor() {
        super('/users', {
            reducerPath: 'users',
            tagType: 'users',
        });
    }
}

export const userApi = new UserApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllUsersQuery,
    useGetByIdQuery: useGetUserByIdQuery,
    useCreateMutation: useCreateUserMutation,
    useUpdateMutation: useUpdateUserMutation,
    useDeleteMutation: useDeleteUserMutation,
    useSearchQuery: useSearchUsersQuery,
    useBulkDeleteMutation: useBulkDeleteUsersMutation,
    useBulkStoreMutation: useBulkStoreUsersMutation,
} = userApi;
