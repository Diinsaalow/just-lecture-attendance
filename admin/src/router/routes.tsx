import React from 'react';
import { Navigate } from 'react-router-dom';

import NotFound from '../pages/404';
import Login from '../pages/login';
import LockScreen from '../pages/login/LockScreen';

import Unauthorized from '../components/errors/Unauthorized';

import Users from '../pages/user';
import Locations from '../pages/location';

import Settings from '../pages/settings';
import SettingsRoles from '../pages/settings/roles';

import SystemDashboard from '../pages/dashboard/SystemDashboard';

export type RouteConfig = {
    path: string;
    element: React.ReactNode;
    layout: 'default' | 'blank';
    errorElement?: React.ReactNode;
    isPublic?: boolean;
    redirectAuthenticated?: boolean;
    children?: RouteConfig[];
    resource?: string;
    action?: string | string[];
};

export const publicRoutes: RouteConfig[] = [
    {
        path: '/auth/login',
        element: <Login />,
        layout: 'blank',
        isPublic: true,
        redirectAuthenticated: true,
    },
    {
        path: '/unauthorized',
        element: <Unauthorized />,
        layout: 'blank',
        isPublic: true,
    },
    {
        path: '*',
        element: <NotFound />,
        layout: 'blank',
        isPublic: true,
    },
];

export const protectedRoutes: RouteConfig[] = [
    {
        path: '/',
        element: <Navigate to="/dashboard/system" replace />,
        layout: 'default',
        isPublic: false,
    },
    {
        path: '/dashboard/system',
        element: <SystemDashboard />,
        layout: 'default',
        isPublic: false,
        resource: 'Dashboard',
        action: 'read',
    },
    {
        path: '/dashboard/sms',
        element: <Navigate to="/dashboard/system" replace />,
        layout: 'default',
        isPublic: false,
    },

    {
        path: '/auth/lockscreen',
        element: <LockScreen />,
        layout: 'blank',
        isPublic: true,
    },

    {
        path: '/users',
        element: <Users />,
        layout: 'default',
        isPublic: false,
        resource: 'User',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/locations',
        element: <Locations />,
        layout: 'default',
        isPublic: false,
        resource: 'Location',
        action: ['read', 'create', 'update', 'delete'],
    },

    {
        path: '/settings',
        element: <Settings />,
        layout: 'default',
        isPublic: false,
        resource: 'Settings',
        action: 'manage',
        children: [
            {
                path: 'roles',
                element: <SettingsRoles />,
                layout: 'default',
                isPublic: false,
                resource: 'Roles',
                action: 'read',
            },
        ],
    },
];

export const routes: RouteConfig[] = [...publicRoutes, ...protectedRoutes];
