export interface IApiResponse<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface IPopulate {
    path: string;
    dir?: string;
    select?: string;
}

export interface IQueryParams {
    /** Passed as top-level query param to the API (e.g. `variant=staff` on GET /users). */
    variant?: 'staff';
    pagination?: boolean;
    query?: Record<string, string | number | boolean | string[]> | object;
    search?: { keyword: string; fields: string[] };
    populate?: IPopulate[];
    options?: {
        limit?: number;
        page?: number;
        populate?: IPopulate[];
        sort?: { [key: string]: 'asc' | 'desc' };
    };
}
