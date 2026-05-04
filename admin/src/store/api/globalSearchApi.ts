import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithToken } from './baseQuery';
import type { IGlobalSearchResponse, IEntitySearchResponse, IGlobalSearchParams, IEntitySearchParams, EntityType } from '../../types/global-search';

export const globalSearchApi = createApi({
    reducerPath: 'globalSearchApi',
    baseQuery: baseQueryWithToken,
    tagTypes: ['GlobalSearch'],
    endpoints: (builder) => ({
        // Global search across all entities
        search: builder.query<IGlobalSearchResponse, IGlobalSearchParams>({
            query: (params) => ({
                url: '/search',
                method: 'POST',
                body: params,
            }),
            providesTags: [{ type: 'GlobalSearch', id: 'LIST' }],
        }),

        // Global search via GET method
        searchGet: builder.query<IGlobalSearchResponse, IGlobalSearchParams>({
            query: (params) => ({
                url: '/search',
                params: {
                    q: params.q,
                    limit_per_type: params.limit_per_type,
                },
            }),
            providesTags: [{ type: 'GlobalSearch', id: 'LIST' }],
        }),

        // Search specific entity type
        searchEntityType: builder.query<IEntitySearchResponse, { entityType: EntityType; params: IEntitySearchParams }>({
            query: ({ entityType, params }) => ({
                url: `/search/${entityType}`,
                method: 'POST',
                body: params,
            }),
            providesTags: (result, error, { entityType }) => [{ type: 'GlobalSearch', id: entityType }],
        }),

        // Search specific entity type via GET method
        searchEntityTypeGet: builder.query<IEntitySearchResponse, { entityType: EntityType; params: IEntitySearchParams }>({
            query: ({ entityType, params }) => ({
                url: `/search/${entityType}`,
                params: {
                    q: params.q,
                    page: params.page,
                    per_page: params.per_page,
                },
            }),
            providesTags: (result, error, { entityType }) => [{ type: 'GlobalSearch', id: entityType }],
        }),
    }),
});

// Export hooks
export const {
    useSearchQuery,
    useSearchGetQuery,
    useSearchEntityTypeQuery,
    useSearchEntityTypeGetQuery,
    useLazySearchQuery,
    useLazySearchGetQuery,
    useLazySearchEntityTypeQuery,
    useLazySearchEntityTypeGetQuery,
} = globalSearchApi;
