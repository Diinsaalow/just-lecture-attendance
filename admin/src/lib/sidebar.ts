import { LayoutDashboard, Users, Settings, MapPin } from 'lucide-react';

import { MenuItem } from '../types/sidebar';

export const sidebarMenu: MenuItem[] = [
    {
        title: 'dashboard',
        icon: LayoutDashboard,
        path: '/dashboard/system',
        resource: 'Dashboard',
        action: 'read',
    },
    {
        title: 'users',
        icon: Users,
        path: '/users',
        resource: 'User',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'locations',
        icon: MapPin,
        path: '/locations',
        resource: 'Location',
        action: ['read', 'create', 'update', 'delete'],
    },
    {
        title: 'settings',
        icon: Settings,
        path: '/settings',
        resource: 'Settings',
        action: 'manage',
    },
];

export const filterMenuByPermissions = (menuItems: MenuItem[], hasPermission: (resource: string, action: string | string[]) => boolean): MenuItem[] => {
    return menuItems
        .map((item) => {
            if (!item.resource || !item.action) {
                return item;
            }

            if (!hasPermission(item.resource, item.action)) {
                return null;
            }

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

export const cleanEmptySections = (menuItems: MenuItem[]): MenuItem[] => {
    const cleaned = menuItems.filter((item, index) => {
        if (item.isSection) {
            const nextNonSectionIndex = menuItems.findIndex((nextItem, nextIndex) => nextIndex > index && !nextItem.isSection);

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

export const getFilteredMenuForUser = (userPermissions: Array<{ resource: string; action: string }>): MenuItem[] => {
    const mockHasPermission = (resource: string, action: string | string[]): boolean => {
        if (typeof action === 'string') {
            return userPermissions.some((permission) => permission.resource === resource && permission.action === action);
        }
        return userPermissions.some((permission) => permission.resource === resource && action.includes(permission.action));
    };

    return cleanEmptySections(filterMenuByPermissions(sidebarMenu, mockHasPermission));
};
