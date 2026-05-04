import React from 'react';
import { Navigate } from 'react-router-dom';


// Not Found
import NotFound from '../pages/404';

// Authentication
import Login from '../pages/login';
import LockScreen from '../pages/login/LockScreen';

// Unauthorized
import Unauthorized from '../components/errors/Unauthorized';

// Users
import Users from '../pages/user';
import Locations from '../pages/location';
import Campaigns from '../pages/campaign';

// Profile
import Profile from '../pages/profile';


// Search
import SearchResults from '../pages/search/SearchResults';

//* settings
import Settings from '../pages/settings';
import SettingsRoles from '../pages/settings/roles';
import SettingsSmsProviders from '../pages/settings/sms_providers';
import Dashboard from '../pages/Index';
import MailSettings from '../pages/settings/mail';
import Recipients from '@/pages/recipients';
import RecipientGroups from '@/pages/recipient-groups';
import SmsMessages from '@/pages/sms-messages';
import SystemDashboard from '../pages/dashboard/SystemDashboard';
import SmsDashboard from '../pages/dashboard/SmsDashboard';

// Reports
import Reports from '../pages/reports';
import CampaignReport from '../pages/reports/CampaignReport';
import SmsReport from '../pages/reports/SmsReport';
import FeedbackReport from '../pages/reports/FeedbackReport';
import RecipientReport from '../pages/reports/RecipientReport';
import UserReport from '../pages/reports/UserReport';


// Define route types
export type RouteConfig = {
    path: string;
    element: React.ReactNode;
    layout: 'default' | 'blank';
    errorElement?: React.ReactNode;
    isPublic?: boolean;
    redirectAuthenticated?: boolean; // New option to redirect authenticated users
    children?: RouteConfig[];
    resource?: string;
    action?: string | string[];
};

// Public routes - accessible without authentication
export const publicRoutes: RouteConfig[] = [
    // auth
    {
        path: '/auth/login',
        element: <Login />,
        layout: 'blank',
        isPublic: true,
        redirectAuthenticated: true,
    },
    // Unauthorized page should be public
    {
        path: '/unauthorized',
        element: <Unauthorized />,
        layout: 'blank',
        isPublic: true,
    },
    // 404 page should also be public
    {
        path: '*',
        element: <NotFound />,
        layout: 'blank',
        isPublic: true,
    },
];

// Protected routes - require authentication
export const protectedRoutes: RouteConfig[] = [
    // Redirect from root to system dashboard
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
        element: <SmsDashboard />,
        layout: 'default',
        isPublic: false,
        resource: 'Dashboard',
        action: 'read',
    },

    // Lock Screen (protected, blank layout, no permission required)
    {
        path: '/auth/lockscreen',
        element: <LockScreen />,
        layout: 'blank',
        isPublic: true,
    },


    // Users

    {
        path: '/users',
        element: <Users />,
        layout: 'default',
        isPublic: false,
    },
    {
        path: '/locations',
        element: <Locations />,
        layout: 'default',
        isPublic: false,
    },
    {
        path: '/campaigns',
        element: <Campaigns />,
        layout: 'default',
        isPublic: false,
    },
    {
        path: '/recipients',
        element: <Recipients />,
        layout: 'default',
        isPublic: false,
    },
    {
        path: '/recipient-groups',
        element: <RecipientGroups />,
        layout: 'default',
        isPublic: false,
        resource: 'Recipient Group',
    },
    // SMS Messages
    {
        path: '/sms-messages',
        element: <SmsMessages />,
        layout: 'default',
        isPublic: false,
        // resource: 'SmsMessage', // Todo: Add resource permission
    },

    // Profile
    {
        path: '/auth/profile',
        element: <Profile />,
        layout: 'default',
        isPublic: false,
        resource: 'Profile',
        action: 'read',
    },

    // Reports
    {
        path: '/reports',
        element: <Reports />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },
    {
        path: '/reports/campaigns',
        element: <CampaignReport />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },
    {
        path: '/reports/sms',
        element: <SmsReport />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },
    {
        path: '/reports/feedback',
        element: <FeedbackReport />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },
    {
        path: '/reports/recipients',
        element: <RecipientReport />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },
    {
        path: '/reports/users',
        element: <UserReport />,
        layout: 'default',
        isPublic: false,
        resource: 'Report',
        action: 'read',
    },

    // Search
    {
        path: '/search',
        element: <SearchResults />,
        layout: 'default',
        isPublic: false,
        resource: 'Search',
        action: 'read',
    },

    //* SETTINGS SECTION
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
            {
                path: 'mail',
                element: <MailSettings />,
                layout: 'default',
                isPublic: false,
                resource: 'Mail',
                action: 'read',
            },

            {
                path: 'sms-providers',
                element: <SettingsSmsProviders />,
                layout: 'default',
                isPublic: false,
                resource: 'SmsProviders',
                action: 'read',
            },
        ],
    },

];

// Combine all routes
export const routes: RouteConfig[] = [...publicRoutes, ...protectedRoutes];
