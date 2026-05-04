import { BaseApi } from './baseApi';
import type { IBook } from '../../types/book';

class BookApi extends BaseApi<IBook> {
    constructor() {
        super('/books', {
            reducerPath: 'bookApi',
            tagType: 'books',
        });
    }
}

export const bookApi = new BookApi().createApi();

// Export individual hooks with proper naming
export const {
    useGetAllQuery: useGetAllBooksQuery,
    useGetByIdQuery: useGetBookByIdQuery,
    useCreateMutation: useCreateBookMutation,
    useUpdateMutation: useUpdateBookMutation,
    useDeleteMutation: useDeleteBookMutation,
    useSearchQuery: useSearchBooksQuery,
    useBulkDeleteMutation: useBulkDeleteBooksMutation,
    useBulkStoreMutation: useBulkStoreBooksMutation,
} = bookApi;
