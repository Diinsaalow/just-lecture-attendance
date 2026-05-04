import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from '../components/auth/PrivateRoute';
import Error500 from '../components/errors/Error500';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { RouteConfig, routes } from './routes';

// Recursively wrap a route with auth guard and, for top-level only, layout
const wrapRoute = (route: RouteConfig, isChild: boolean = false): any => {
    const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
        if (isChild) {
            return <>{children}</>;
        }
        return route.layout === 'blank' ? <BlankLayout>{children}</BlankLayout> : <DefaultLayout>{children}</DefaultLayout>;
    };

    const element = route.isPublic ? (
        <LayoutWrapper>{route.element}</LayoutWrapper>
    ) : (
        <PrivateRoute resource={route.resource} action={route.action}>
            <LayoutWrapper>{route.element}</LayoutWrapper>
        </PrivateRoute>
    );

    return {
        ...route,
        element,
        errorElement: <BlankLayout>{route.errorElement || <Error500 />}</BlankLayout>,
        children: route.children ? route.children.map((child: RouteConfig) => wrapRoute(child, true)) : undefined,
    };
};

const finalRoutes = routes.map((route) => wrapRoute(route));

const router = createBrowserRouter(finalRoutes);

export default router;
