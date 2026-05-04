import { createApi } from '@reduxjs/toolkit/query/react';
import { IApiResponse, IQueryParams } from '../../types/api';
import { formatQueryParams } from '../../utils';
import { baseQueryWithToken } from './baseQuery';

type ID = number | string;

export interface IBaseApiConfig {
    reducerPath: string;
    tagType: string;
}

/**
 * Generic BaseApi class that provides standard CRUD operations for any entity
 *
 * Features:
 * - getAll: Get paginated list of entities with query/search/sort/populate support
 * - getById: Get single entity by ID
 * - create: Create new entity (supports FormData for file uploads)
 * - update: Update existing entity by ID
 * - delete: Delete entity by ID
 * - search: Search entities with custom search endpoint
 * - bulkDelete: Delete multiple entities by IDs
 * - bulkStore: Create multiple entities at once
 *
 * Usage:
 * ```typescript
 * class UserApi extends BaseApi<IUser> {
 *   constructor() {
 *     super('/users', { reducerPath: 'users', tagType: 'users' });
 *   }
 * }
 * export const userApi = new UserApi().createApi();
 * ```
 *
 * To add custom endpoints, override createApi():
 * ```typescript
 * createApi() {
 *   const baseApi = super.createApi();
 *   return baseApi.injectEndpoints({
 *     endpoints: (builder) => ({
 *       customEndpoint: builder.query<ReturnType, ParamType>({...})
 *     })
 *   });
 * }
 * ```
 */
export class BaseApi<T extends { _id: string }> {
    protected endpoint: string;
    protected config: IBaseApiConfig;

    constructor(endpoint: string, config: IBaseApiConfig) {
        this.endpoint = endpoint;
        this.config = config;
    }

    createApi() {
        return createApi({
            reducerPath: this.config.reducerPath,
            baseQuery: baseQueryWithToken,
            tagTypes: [this.config.tagType],
            endpoints: (builder) => ({
                getAll: builder.query<IApiResponse<T>, IQueryParams>({
                    query: (params) => ({
                        url: this.endpoint,
                        params: formatQueryParams(params),
                    }),
                    providesTags: (result) =>
                        result
                            ? [...result.docs.map((item: T) => ({ type: this.config.tagType, id: item._id })), { type: this.config.tagType, id: 'LIST' }]
                            : [{ type: this.config.tagType, id: 'LIST' }],
                }),

                getById: builder.query<T, ID | { id: ID; params?: IQueryParams }>({
                    query: (arg) => {
                        const id = typeof arg === 'object' && 'id' in arg ? arg.id : (arg as ID);
                        const params = typeof arg === 'object' && 'id' in arg && arg.params ? formatQueryParams(arg.params) : undefined;
                        return {
                            url: `${this.endpoint}/${id}`,
                            params,
                        };
                    },
                    providesTags: (result, error, arg) => {
                        const id = typeof arg === 'object' && 'id' in arg ? arg.id : (arg as ID);
                        return [{ type: this.config.tagType, id }];
                    },
                }),

                create: builder.mutation<T, Partial<T> | FormData>({
                    query: (data) => ({
                        url: this.endpoint,
                        method: 'POST',
                        body: data,
                        headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),

                update: builder.mutation<T, { id: ID; data: Partial<T> }>({
                    query: ({ id, data }) => ({
                        url: `${this.endpoint}/${id}`,
                        method: 'PATCH',
                        body: data,
                    }),
                    invalidatesTags: (result, error, { id }) => [
                        { type: this.config.tagType, id },
                        { type: this.config.tagType, id: 'LIST' },
                    ],
                }),

                delete: builder.mutation<void, ID>({
                    query: (id) => ({
                        url: `${this.endpoint}/${id}`,
                        method: 'DELETE',
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),

                search: builder.query<IApiResponse<T>, any>({
                    query: (params) => ({
                        url: `${this.endpoint}/search`,
                        params: formatQueryParams(params),
                    }),
                    providesTags: (result) =>
                        result
                            ? [...result.docs.map((item: T) => ({ type: this.config.tagType, id: item._id })), { type: this.config.tagType, id: 'SEARCH' }]
                            : [{ type: this.config.tagType, id: 'SEARCH' }],
                }),

                bulkDelete: builder.mutation<{ deletedCount: number; message: string }, ID[]>({
                    query: (ids) => ({
                        url: `${this.endpoint}/bulk/delete`,
                        method: 'DELETE',
                        body: { ids },
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),

                bulkStore: builder.mutation<{ created_count: number }, { entries: Partial<T>[] }>({
                    query: (data) => ({
                        url: `${this.endpoint}/bulk`,
                        method: 'POST',
                        body: data,
                    }),
                    invalidatesTags: [{ type: this.config.tagType, id: 'LIST' }],
                }),
            }),
        });
    }
}
