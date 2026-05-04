// Import Lucide icons
import { LayoutDashboard, Users, Settings, Trash2, ClipboardList, Folder, BookOpen, Star, CreditCard, Bell, BarChart2, ShoppingCart, UserCheck, MapPin, Megaphone, MessageSquare } from 'lucide-react';


// Import interface
import { MenuItem } from '../types/sidebar';

export const sidebarMenu: MenuItem[] = [
    {
        title: 'dashboard',
        icon: LayoutDashboard,
        path: '/dashboard/system',
        resource: 'Dashboard',
        action: 'read',
        children: [
            {
                title: 'system_dashboard',
                path: '/dashboard/system',
                resource: 'Dashboard',
                action: 'read',
            },
            {
                title: 'sms_dashboard',
                path: '/dashboard/sms',
                resource: 'Dashboard',
                action: 'read',
            },
        ],
    },

    {
        title: 'reports',
        icon: BarChart2,
        path: '/reports',
        resource: 'Report',
        action: 'read',
        children: [
            {
                title: 'campaign_reports',
                path: '/reports/campaigns',
                resource: 'Report',
                action: 'read',
            },
            {
                title: 'sms_reports',
                path: '/reports/sms',
                resource: 'Report',
                action: 'read',
            },
            {
                title: 'feedback_reports',
                path: '/reports/feedback',
                resource: 'Report',
                action: 'read',
            },
            {
                title: 'recipient_reports',
                path: '/reports/recipients',
                resource: 'Report',
                action: 'read',
            },
            {
                title: 'user_reports',
                path: '/reports/users',
                resource: 'Report',
                action: 'read',
            },
        ]
    },

    // receipts




    //* CONTENT MANAGEMENT SECTION
    {
        title: 'content_management',
        isSection: true,
        resource: 'ContentManagement', // Assuming a generic resource or specific check
        action: ['read', 'manage'],
    },
    {
        title: 'locations',
        icon: MapPin,
        path: '/locations',
        resource: 'Location',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'campaigns',
        icon: Megaphone,
        path: '/campaigns',
        resource: 'Campaign',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'recipients',
        icon: Users,
        path: '/recipients',
        resource: 'Recipient',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'Recipient Group',
        icon: Users,
        path: '/recipient-groups',
        resource: 'Recipient Group',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'SMS Messages',
        icon: MessageSquare,
        path: '/sms-messages',
        resource: 'SmsMessage',
        action: ['read', 'create', 'update', 'delete'],
    },



    //* CONFIGURATION SECTION
    {
        title: 'configuration',
        isSection: true,
        resource: 'Configuration',
        action: ['read', 'manage'],
    },
    {
        title: 'users',
        icon: Users,
        path: '/users',
        resource: 'User',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'settings',
        icon: Settings,
        path: '/settings',
        resource: 'Setting',
        action: ['manage'],
    },
];

/**
 * Filter sidebar menu items based on user permissions using resource and action
 * @param menuItems - Array of menu items to filter
 * @param hasPermission - Function to check if user has permission for a resource and action
 * @returns Filtered array of menu items
 */
export const filterMenuByPermissions = (menuItems: MenuItem[], hasPermission: (resource: string, action: string | string[]) => boolean): MenuItem[] => {
    return menuItems
        .map((item) => {
            // If item has no resource/action, show it
            if (!item.resource || !item.action) {
                return item;
            }

            // Check if user has permission for the resource and action
            if (!hasPermission(item.resource, item.action)) {
                return null;
            }

            // If item has children, filter them too
            if (item.children) {
                const filteredChildren = filterMenuByPermissions(item.children, hasPermission);
                return {
                    ...item,
                    children: filteredChildren,
                };
            }

            return item;
        })
        .filter((item): item is MenuItem => item !== null);
};

/**
 * Clean up empty sections after permission filtering
 * @param menuItems - Array of menu items to clean
 * @returns Cleaned array of menu items
 */
export const cleanEmptySections = (menuItems: MenuItem[]): MenuItem[] => {
    const cleaned = menuItems.filter((item, index) => {
        // If it's a section, check if there are any non-section items after it
        if (item.isSection) {
            const nextNonSectionIndex = menuItems.findIndex((nextItem, nextIndex) => nextIndex > index && !nextItem.isSection);

            // If there's no next non-section item, or if the next non-section item is after another section, remove this section
            if (nextNonSectionIndex === -1) {
                return false;
            }

            const nextSectionIndex = menuItems.findIndex((nextItem, nextIndex) => nextIndex > index && nextItem.isSection);

            if (nextSectionIndex !== -1 && nextSectionIndex < nextNonSectionIndex) {
                return false;
            }
        }

        return true;
    });

    return cleaned;
};

/**
 * Example function to demonstrate permission filtering
 * This can be used for testing or documentation purposes
 * @param userPermissions - Array of permission objects with resource and action
 * @returns Filtered sidebar menu for the user
 */
export const getFilteredMenuForUser = (userPermissions: Array<{ resource: string; action: string }>): MenuItem[] => {
    const mockHasPermission = (resource: string, action: string | string[]): boolean => {
        if (typeof action === 'string') {
            return userPermissions.some((permission) => permission.resource === resource && permission.action === action);
        } else {
            return userPermissions.some((permission) => permission.resource === resource && action.includes(permission.action));
        }
    };

    return cleanEmptySections(filterMenuByPermissions(sidebarMenu, mockHasPermission));
};
