import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';

interface PrivateRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    resource?: string;
    action?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole, resource, action }) => {
    const { isAuthenticated, user, isLoading, token, isLocked, isUserInfoLoading } = useAuth();
    const { hasPermission } = usePermission();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login with current location as redirect path
            navigate('/auth/login', {
                state: { from: location },
                replace: true,
            });
        }
    }, [isAuthenticated, isLoading, navigate, location]);

    useEffect(() => {
        if (requiredRole && user && user.role !== requiredRole) {
            // User doesn't have required role, redirect to unauthorized page
            navigate('/unauthorized', { replace: true });
        }
    }, [user, requiredRole, navigate]);

    // Redirect to lock screen when session is locked
    useEffect(() => {
        if (isAuthenticated && isLocked && location.pathname !== '/auth/lockscreen') {
            navigate('/auth/lockscreen', { replace: true });
        }
    }, [isAuthenticated, isLocked, navigate, location.pathname]);

    // Check permissions if resource and action are provided
    useEffect(() => {
        if (resource && action && isAuthenticated && !isLoading && user) {
            if (!hasPermission(resource, action)) {
                // User doesn't have required permission, redirect to unauthorized page
                navigate('/unauthorized', { replace: true });
            }
        }
    }, [resource, action, isAuthenticated, isLoading, hasPermission, navigate, user]);

    // Show loading spinner while checking authentication
    if (isLoading || isUserInfoLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    if (isLocked && location.pathname !== '/auth/lockscreen') {
        return null;
    }

    // Don't render children if user doesn't have required role
    if (requiredRole && user && user.role !== requiredRole) {
        return null;
    }

    // Don't render children if user doesn't have required permission
    if (resource && action && !hasPermission(resource, action)) {
        return null;
    }

    return <>{children}</>;
};

export default PrivateRoute;
