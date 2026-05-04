import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../store';
import { useGetUserInfoQuery, useLockSessionMutation, useLoginMutation, useLogoutMutation, useRefreshTokenMutation } from '../store/api/authApi';
import { clearError, lockSession as lockSessionAction, logout, setCredentials, setError, setLoading, updateToken, updateUser } from '../store/slices/authSlice';
import { IAuthResponse, ILoginCredentials, IUser } from '../types/auth';
import { mapLoginResponseUser } from '../utils/mapAuthUser';

export const useAuth = () => {
    const dispatch = useDispatch<AppDispatch>();
    const auth = useSelector((state: IRootState) => state.auth);

    const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
    const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const [lockSessionMutation] = useLockSessionMutation();

    // Get user info query - only runs when authenticated and no user data exists
    const {
        data: userInfo,
        isLoading: isUserInfoLoading,
        error: userInfoError,
        refetch: refetchUserInfo,
    } = useGetUserInfoQuery(undefined, {
        skip: !auth.isAuthenticated || !!auth.user,
    });

    // Sync API data with Redux store when userInfo changes
    useEffect(() => {
        if (userInfo && auth.isAuthenticated) {
            dispatch(updateUser(userInfo));
        }
    }, [userInfo, auth.isAuthenticated, dispatch]);

    // Handle getUserInfo query errors - clear auth state if token is invalid
    useEffect(() => {
        if (userInfoError && auth.isAuthenticated) {
            // If the getUserInfo query fails, it means the token is invalid
            // Clear the authentication state and redirect to login
            dispatch(logout());
        }
    }, [userInfoError, auth.isAuthenticated, dispatch]);

    const login = async (credentials: ILoginCredentials) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const result: IAuthResponse = await loginMutation(credentials).unwrap();

            const user = mapLoginResponseUser(result.user);

            dispatch(
                setCredentials({
                    user,
                    token: result.accessToken,
                }),
            );

            return { success: true, data: result };
        } catch (error: any) {
            const errorMessage = error?.data?.message || 'Login failed';
            dispatch(setError(errorMessage));
            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            dispatch(setLoading(false));
        }
    };

    const logoutUser = async () => {
        try {
            if (auth.token) {
                await logoutMutation().unwrap();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            dispatch(logout());
        }
    };

    const refreshAccessToken = async () => {
        if (!auth.token || !auth.user?._id) {
            return false;
        }

        try {
            // For now, we'll use the current token as refresh token
            // In a real implementation, you might want to store refresh tokens separately
            const result = await refreshTokenMutation({
                userId: auth.user._id,
                refreshToken: auth.token,
            }).unwrap();

            // Update the token in the store
            dispatch(updateToken(result.accessToken));
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            dispatch(logout());
            return false;
        }
    };

    const updateUserInfo = (user: IUser) => {
        dispatch(updateUser(user));
    };

    const lock = async () => {
        try {
            await lockSessionMutation().unwrap();
            dispatch(lockSessionAction());
            return { success: true } as const;
        } catch (error) {
            return { success: false } as const;
        }
    };

    return {
        // State
        user: auth.user,
        token: auth.token,
        isAuthenticated: auth.isAuthenticated && !userInfoError,
        isLocked: auth.isLocked,
        isLoading: auth.loading || isUserInfoLoading,
        error: auth.error,

        // Loading states
        isLoginLoading,
        isLogoutLoading,
        isUserInfoLoading,

        // Actions
        login,
        logout: logoutUser,
        refreshAccessToken,
        updateUserInfo,
        refetchUserInfo,
        lock,

        // Computed
        hasRole: (role: string) => auth.user?.role === role,
        isAdmin: auth.user?.role === 'admin',
    };
};
