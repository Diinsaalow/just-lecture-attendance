import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithToken } from './baseQuery';
import { IDirectoryResponse, IMediaQueryParams, ICreateDirectoryRequest, IUploadFileRequest, IChunkedUploadRequest, IChunkedUploadResponse } from '../../types/media';

export const mediaApi = createApi({
    reducerPath: 'mediaApi',
    baseQuery: baseQueryWithToken,
    tagTypes: ['Media', 'Directory'],
    endpoints: (builder) => ({
        getDirectory: builder.query<IDirectoryResponse, IMediaQueryParams>({
            query: (params) => ({
                url: '/media/directory',
                params: {
                    path: params.path,
                    page: params.page || 1,
                    limit: params.limit || 50,
                    search: params.search,
                    type: params.type,
                    sortBy: params.sortBy || 'name',
                    sortOrder: params.sortOrder || 'asc',
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.children.map((item) => ({ type: 'Media' as const, id: item._id })),
                          { type: 'Directory' as const, id: result.data.parent._id },
                          { type: 'Directory' as const, id: 'LIST' },
                      ]
                    : [{ type: 'Directory' as const, id: 'LIST' }],
        }),

        createDirectory: builder.mutation<{ message: string; data: any }, ICreateDirectoryRequest>({
            query: (data) => ({
                url: '/media/directory',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Directory', id: 'LIST' }],
        }),

        uploadFile: builder.mutation<{ message: string; data: any }, IUploadFileRequest>({
            query: (data) => {
                const formData = new FormData();
                formData.append('file', data.file);
                if (data.parent) formData.append('parent', data.parent);
                if (data.visibility) formData.append('visibility', data.visibility);

                return {
                    url: '/media/upload',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [
                { type: 'Media', id: 'LIST' },
                { type: 'Directory', id: 'LIST' },
            ],
        }),

        uploadChunk: builder.mutation<IChunkedUploadResponse, FormData>({
            query: (body) => ({
                url: '/media/chunk-upload',
                method: 'POST',
                body: body,
                formData: true,
            }),
            // Invalidate only when server signals finalization (not during intermediate chunks)
            invalidatesTags: (result) => {
                const isFinal = result && (result as any).data && (result as any).data.status !== 'uploading';
                return isFinal
                    ? [
                          { type: 'Media', id: 'LIST' },
                          { type: 'Directory', id: 'LIST' },
                      ]
                    : [];
            },
        }),

        deleteMedia: builder.mutation<{ message: string }, { id: string; force?: boolean }>({
            query: ({ id, force }) => ({
                url: `/media/${id}`,
                method: 'DELETE',
                params: force ? { force: 'true' } : {},
            }),
            invalidatesTags: [
                { type: 'Media', id: 'LIST' },
                { type: 'Directory', id: 'LIST' },
            ],
        }),

        updateMedia: builder.mutation<{ message: string; data: any }, { id: string; data: Partial<any> }>({
            query: ({ id, data }) => ({
                url: `/media/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: [
                { type: 'Media', id: 'LIST' },
                { type: 'Directory', id: 'LIST' },
            ],
        }),
    }),
});

export const { useGetDirectoryQuery, useCreateDirectoryMutation, useUploadFileMutation, useUploadChunkMutation, useDeleteMediaMutation, useUpdateMediaMutation } = mediaApi;
