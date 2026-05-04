import { IApiResponse, IQueryParams, IPopulate } from '../../types/api';

interface UseFetchTableDataProps<T> {
    title: string;
    fetchData: (param: IQueryParams) => any; // RTK Query hook
    query?: object;
    currentPage: number;
    rowsPerPage: number;
    search: string;
    searchFields: string[];
    populate?: IPopulate[];
    sortBy: Record<string, 'asc' | 'desc'>;
    sortDirection: string;
}

function useFetchTableData<T>({ title, fetchData, query = {}, currentPage, rowsPerPage, search, searchFields, populate = [], sortBy }: UseFetchTableDataProps<T>) {
    // Format parameters according to IQueryParams interface
    const params: IQueryParams = {
        query,
        search: search && search.trim() !== '' ? { keyword: search, fields: searchFields } : undefined,
        options: {
            limit: rowsPerPage,
            page: currentPage,
            populate,
            sort: sortBy,
        },
    };

    // Use RTK Query hook directly
    const result = fetchData(params);

    return {
        data: result.data,
        isLoading: result.isLoading,
        error: result.error,
        refetch: result.refetch,
    };
}

export default useFetchTableData;
