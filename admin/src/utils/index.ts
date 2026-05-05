export const createQueryString = (data: any, parentKey = ''): string => {
    const queryStringArray = Object.keys(data).map((key) => {
        const currentKey = parentKey ? `${parentKey}[${key}]` : key;
        const val = data[key];

        if (val !== null && typeof val === 'object') {
            return createQueryString(val, currentKey);
        }

        return `${currentKey}=${`${val}`.replace(/\s/g, '+')}`;
    });

    // Filter out empty values and join with '&'
    return queryStringArray.filter((query) => query.length > 0).join('&');
};

/**
 * Transforms IQueryParams structure into API-compatible URL parameters
 * @param options The IQueryParams object to transform
 * @returns A record of URL parameters ready to use in API requests
 */
export const formatQueryParams = (options: any) => {
    if (!options) return {};

    const params: Record<string, any> = {};

    if (options?.variant !== undefined && options.variant !== '') {
        params['variant'] = options.variant;
    }

    // Handle pagination toggle
    if (options.pagination !== undefined) {
        params['pagination'] = options.pagination;
    }

    // Handle top-level date parameters
    if (options.startDate) {
        params['startDate'] = options.startDate;
    }
    if (options.endDate) {
        params['endDate'] = options.endDate;
    }

    // Handle instructorId parameter
    if (options.instructorId) {
        params['instructorId'] = options.instructorId;
    }

    // Handle query parameters
    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
            params[`query[${key}]`] = value;
        });
    }

    // Handle search parameters
    if (options.search) {
        params['search[keyword]'] = options.search.keyword;
        if (options.search.fields && options.search.fields.length > 0) {
            options.search.fields.forEach((field: string, index: number) => {
                params[`search[fields][${index}]`] = field;
            });
        }
    }

    // Handle root-level populate parameters (for single item queries)
    if (options.populate) {
        const processPopulate = (populate: any, basePath: string) => {
            if (typeof populate === 'string') {
                return { path: populate };
            }
            return populate;
        };

        const addPopulateParams = (populate: any, baseKey: string) => {
            if (!populate) return;

            // Add basic populate properties
            if (populate.path) params[`${baseKey}[path]`] = populate.path;
            if (populate.dir) params[`${baseKey}[dir]`] = populate.dir;
            if (populate.select) params[`${baseKey}[select]`] = populate.select;

            // Handle nested populate
            if (populate.populate) {
                if (Array.isArray(populate.populate)) {
                    // Handle array of nested populate options
                    populate.populate.forEach((nestedPopulate: any, nestedIndex: number) => {
                        const nestedPopulateObj = processPopulate(nestedPopulate, `${baseKey}[populate][${nestedIndex}]`);
                        const nestedKey = `${baseKey}[populate][${nestedIndex}]`;
                        addPopulateParams(nestedPopulateObj, nestedKey);
                    });
                } else if (typeof populate.populate === 'string') {
                    // Handle string populate
                    params[`${baseKey}[populate]`] = populate.populate;
                } else if (typeof populate.populate === 'object') {
                    // Handle single object populate
                    const nestedKey = `${baseKey}[populate]`;
                    addPopulateParams(populate.populate, nestedKey);
                }
            }
        };

        options.populate.forEach((populate: any, index: number) => {
            const baseKey = `populate[${index}]`;
            addPopulateParams(populate, baseKey);
        });
    }

    // Handle options parameters
    if (options.options) {
        // Pagination
        if (options.options.page !== undefined) params['options[page]'] = options.options.page;
        if (options.options.limit !== undefined) params['options[limit]'] = options.options.limit;

        // Sorting
        if (options.options.sort) {
            Object.entries(options.options.sort).forEach(([field, direction]) => {
                params[`options[sort][${field}]`] = direction;
            });
        }

        // Population
        if (options.options.populate) {
            const processPopulate = (populate: any, basePath: string) => {
                if (typeof populate === 'string') {
                    return { path: populate };
                }
                return populate;
            };

            const addPopulateParams = (populate: any, baseKey: string) => {
                if (!populate) return;

                // Add basic populate properties
                if (populate.path) params[`${baseKey}[path]`] = populate.path;
                if (populate.dir) params[`${baseKey}[dir]`] = populate.dir;
                if (populate.select) params[`${baseKey}[select]`] = populate.select;

                // Handle nested populate
                if (populate.populate) {
                    if (Array.isArray(populate.populate)) {
                        // Handle array of nested populate options
                        populate.populate.forEach((nestedPopulate: any, nestedIndex: number) => {
                            const nestedPopulateObj = processPopulate(nestedPopulate, `${baseKey}[populate][${nestedIndex}]`);
                            const nestedKey = `${baseKey}[populate][${nestedIndex}]`;
                            addPopulateParams(nestedPopulateObj, nestedKey);
                        });
                    } else if (typeof populate.populate === 'string') {
                        // Handle string populate
                        params[`${baseKey}[populate]`] = populate.populate;
                    } else if (typeof populate.populate === 'object') {
                        // Handle single object populate
                        const nestedKey = `${baseKey}[populate]`;
                        addPopulateParams(populate.populate, nestedKey);
                    }
                }
            };

            options.options.populate.forEach((populate: any, index: number) => {
                const baseKey = `options[populate][${index}]`;
                addPopulateParams(populate, baseKey);
            });
        }
    }

    return params;
};

/**
 * Converts a sort object to a string format for UI components
 * @param sortObj The sort object (e.g. { createdAt: "desc" })
 * @returns Formatted sort string (e.g. "createdAt:desc")
 */
export const formatSortString = (sortObj?: Record<string, string>) => {
    if (!sortObj || Object.keys(sortObj).length === 0) return '';

    return Object.entries(sortObj)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
};

/**
 * Parses a sort string into a sort object
 * @param sortString The sort string (e.g. "createdAt:desc")
 * @returns Sort object (e.g. { createdAt: "desc" })
 */
export const parseSortString = (sortString?: string) => {
    if (!sortString) return { createdAt: 'desc' };

    const sortObj: Record<string, 'asc' | 'desc'> = {};
    const parts = sortString.split(',');

    parts.forEach((part) => {
        const [field, direction] = part.split(':');
        if (field && (direction === 'asc' || direction === 'desc')) {
            sortObj[field] = direction;
        }
    });

    return Object.keys(sortObj).length > 0 ? sortObj : { createdAt: 'desc' };
};
