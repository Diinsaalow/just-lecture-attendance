import React from 'react';
import { Navigate } from 'react-router-dom';

import NotFound from '../pages/404';
import Login from '../pages/login';
import LockScreen from '../pages/login/LockScreen';

import Unauthorized from '../components/errors/Unauthorized';

import UsersModuleLayout from '../pages/user/UsersModuleLayout';
import UsersPage from '../pages/user/UsersPage';
import LecturersPage from '../pages/user/lecturers';
import AcademicYears from '../pages/academic-year';
import Campuses from '../pages/campus';
import Faculties from '../pages/faculty';
import Departments from '../pages/department';
import Semesters from '../pages/semester';
import Periods from '../pages/period';
import ClassSessions from '../pages/class-session';
import Classes from '../pages/classes';
import Courses from '../pages/course';
import Halls from '../pages/hall';

import Settings from '../pages/settings';
import SettingsRoles from '../pages/settings/roles';

import SystemDashboard from '../pages/dashboard/SystemDashboard';

export type RouteConfig = {
    path?: string;
    index?: boolean;
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
        element: <UsersModuleLayout />,
        layout: 'default',
        isPublic: false,
        resource: 'User',
        action: ['read', 'create', 'update', 'delete'],
        children: [
            {
                index: true,
                element: <UsersPage />,
                layout: 'default',
                isPublic: false,
                resource: 'User',
                action: ['read', 'create', 'update', 'delete'],
            },
            {
                path: 'lecturers',
                element: <LecturersPage />,
                layout: 'default',
                isPublic: false,
                resource: 'User',
                action: ['read', 'create', 'update', 'delete'],
            },
        ],
    },

    {
        path: '/academic-years',
        element: <AcademicYears />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/campuses',
        element: <Campuses />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/faculties',
        element: <Faculties />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/departments',
        element: <Departments />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/semesters',
        element: <Semesters />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/courses',
        element: <Courses />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/halls',
        element: <Halls />,
        layout: 'default',
        isPublic: false,
        resource: 'Hall',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/periods',
        element: <Periods />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        path: '/class-sessions',
        element: <ClassSessions />,
        layout: 'default',
        isPublic: false,
        resource: 'ClassSession',
        action: ['read', 'create', 'update'],
    },
    {
        path: '/classes',
        element: <Classes />,
        layout: 'default',
        isPublic: false,
        resource: 'AcademicSetup',
        action: ['read', 'create', 'update', 'delete'],
    },

    {
        path: '/settings',
        element: <Settings />,
        layout: 'default',
        isPublic: false,
        resource: 'Settings',
        action: 'read',
        children: [
            {
                path: 'roles',
                element: <SettingsRoles />,
                layout: 'default',
                isPublic: false,
                resource: 'Role',
                action: ['read', 'create', 'update', 'delete'],
            },
        ],
    },
];

export const routes: RouteConfig[] = [...publicRoutes, ...protectedRoutes];
