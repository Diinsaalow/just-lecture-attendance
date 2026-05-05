import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { storageUtil } from '../../utils/storage';

// Store reference for dispatching actions
let storeRef: any = null;

// Function to set store reference
export const setStoreReference = (store: any) => {
    storeRef = store;
};

// Custom base query that handles 401 errors
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    prepareHeaders: (headers) => {
        const token = storageUtil.getToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// Custom base query with 401 error handling
export const baseQueryWithToken: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Check if the response is a 401 error
    if (result.error && result.error.status === 401) {
        // Check if this is not an auth endpoint to avoid infinite loops
        const url = typeof args === 'string' ? args : args.url;
        const isAuthEndpoint =
            url && (url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password'));

        // Only auto-logout for non-auth endpoints
        if (!isAuthEndpoint) {
            console.warn('401 Unauthorized response received from:', url);
            console.warn('Auto-logging out user...');

            // Clear auth data from storage
            storageUtil.clearAuth();

            // Dispatch logout action to clear Redux state if store is available
            if (storeRef) {
                try {
                    storeRef.dispatch({ type: 'auth/logout' });
                    console.log('Logout action dispatched successfully');
                } catch (error) {
                    console.warn('Failed to dispatch logout action:', error);
                }
            }

            // Also dispatch a custom event as fallback
            const logoutEvent = new CustomEvent('autoLogout', {
                detail: {
                    reason: 'Unauthorized API response',
                    url,
                    timestamp: new Date().toISOString(),
                },
            });
            window.dispatchEvent(logoutEvent);

            // Redirect to login page
            window.location.href = '/auth/login';
        } else {
            console.log('401 error on auth endpoint, skipping auto-logout:', url);
        }
    }

    // Check if response is 403 Forbidden — user may lack permission
    if (result.error && result.error.status === 403) {
        const url = typeof args === 'string' ? args : args.url;
        try {
            const { toast } = await import('sonner');
            toast.error('You do not have permission to perform this action.', {
                description: typeof url === 'string' ? url : undefined,
            });
        } catch {
            console.warn('403 Forbidden:', url);
        }
    }

    if (result.error && result.error.status !== 401 && result.error.status !== 403) {
        const url = typeof args === 'string' ? args : args.url;
        console.warn(`API Error ${result.error.status} from ${url}:`, result.error);
    }

    return result;
};
