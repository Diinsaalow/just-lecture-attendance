import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, redirectTo = '/dashboard/system' }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user is authenticated and not loading, redirect them away from public routes
        if (!isLoading && isAuthenticated) {
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If user is authenticated, don't render children (will redirect)
    if (isAuthenticated) {
        return null;
    }

    // Render children for unauthenticated users
    return <>{children}</>;
};

export default PublicRoute;
