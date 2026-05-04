import { BaseApi } from './baseApi';
import type { ILevel } from '../../types/level';

class LevelApi extends BaseApi<ILevel> {
    constructor() {
        super('/levels', {
            reducerPath: 'levelApi',
            tagType: 'levels',
        });
    }
}

export const levelApi = new LevelApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllLevelsQuery,
    useGetByIdQuery: useGetLevelByIdQuery,
    useCreateMutation: useCreateLevelMutation,
    useUpdateMutation: useUpdateLevelMutation,
    useDeleteMutation: useDeleteLevelMutation,
    useSearchQuery: useSearchLevelsQuery,
    useBulkDeleteMutation: useBulkDeleteLevelsMutation,
    useBulkStoreMutation: useBulkStoreLevelsMutation,
} = levelApi;
