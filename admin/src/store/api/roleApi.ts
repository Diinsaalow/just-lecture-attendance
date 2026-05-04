import { BaseApi } from './baseApi';
import type { IRole, AvailablePermission } from '../../types/auth';

class RoleApi extends BaseApi<IRole> {
    constructor() {
        super('/roles', {
            reducerPath: 'roles',
            tagType: 'roles',
        });
    }

    createApi() {
        const base = super.createApi();
        return base.injectEndpoints({
            endpoints: (builder) => ({
                getAvailablePermissions: builder.query<AvailablePermission[], void>({
                    query: () => ({ url: `/roles/permissions` }),
                    providesTags: [{ type: 'roles', id: 'PERMISSIONS' }],
                }),
                updateRolePermissions: builder.mutation<IRole, { id: string; ability: any[] }>({
                    query: ({ id, ability }) => ({
                        url: `/roles/${id}/permissions`,
                        method: 'PATCH',
                        body: { ability },
                    }),
                    invalidatesTags: (result, error, { id }) => [
                        { type: 'roles', id },
                        { type: 'roles', id: 'LIST' },
                    ],
                }),
            }),
        });
    }
}

export const roleApi = new RoleApi().createApi();

export const {
    useGetAllQuery: useGetAllRolesQuery,
    useGetByIdQuery: useGetRoleByIdQuery,
    useCreateMutation: useCreateRoleMutation,
    useUpdateMutation: useUpdateRoleMutation,
    useDeleteMutation: useDeleteRoleMutation,
    useSearchQuery: useSearchRolesQuery,
    useBulkDeleteMutation: useBulkDeleteRolesMutation,
    useBulkStoreMutation: useBulkStoreRolesMutation,
    useGetAvailablePermissionsQuery,
    useUpdateRolePermissionsMutation,
} = roleApi;
