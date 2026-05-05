import {
    LayoutDashboard,
    Users,
    Settings,
    GraduationCap,
    CalendarDays,
    Building2,
    School,
    Layers,
    BookOpen,
    Library,
    Clock,
    MapPinned,
} from 'lucide-react';

import { MenuItem } from '../types/sidebar';

const academicActions = ['read', 'create', 'update', 'delete'] as string[];

export const sidebarMenu: MenuItem[] = [
    {
        title: 'dashboard',
        icon: LayoutDashboard,
        path: '/dashboard/system',
        resource: 'Dashboard',
        action: 'read',
    },
    {
        title: 'content_management',
        isSection: true,
    },
    {
        title: 'academic_year',
        icon: CalendarDays,
        path: '/academic-years',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'campus_menu',
        icon: Building2,
        path: '/campuses',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'halls_menu',
        icon: MapPinned,
        path: '/halls',
        resource: 'Hall',
        action: academicActions,
    },
    {
        title: 'faculty_menu',
        icon: School,
        path: '/faculties',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'department_menu',
        icon: Layers,
        path: '/departments',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'semester_menu',
        icon: BookOpen,
        path: '/semesters',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'courses_menu',
        icon: Library,
        path: '/courses',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'periods_menu',
        icon: Clock,
        path: '/periods',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'classes_menu',
        icon: GraduationCap,
        path: '/classes',
        resource: 'AcademicSetup',
        action: academicActions,
    },
    {
        title: 'users',
        icon: Users,
        resource: 'User',
        action: ['read', 'create', 'update', 'delete'],
        children: [
            {
                title: 'users',
                path: '/users',
                resource: 'User',
                action: ['read', 'create', 'update', 'delete'],
            },
            {
                title: 'lecturers_menu',
                path: '/users/lecturers',
                resource: 'User',
                action: ['read', 'create', 'update', 'delete'],
            },
        ],
    },
    {
        title: 'settings',
        icon: Settings,
        path: '/settings',
        resource: 'Settings',
        action: 'read',
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

const ACADEMIC_PATH_RE = /^\/(academic-years|campuses|halls|faculties|departments|semesters|courses|periods|classes)(\/.*)?$/;

/** Hide the content management section header if no academic pages remain after permission filtering. */
export const pruneOrphanContentManagementSection = (menuItems: MenuItem[]): MenuItem[] => {
    const idx = menuItems.findIndex((i) => i.isSection && i.title === 'content_management');
    if (idx === -1) {
        return menuItems;
    }
    const after = menuItems.slice(idx + 1);
    const hasAcademic = after.some((i) => i.path && ACADEMIC_PATH_RE.test(i.path));
    if (!hasAcademic) {
        return menuItems.filter((_, i) => i !== idx);
    }
    return menuItems;
};

export const getFilteredMenuForUser = (userPermissions: Array<{ resource: string; action: string }>): MenuItem[] => {
    const mockHasPermission = (resource: string, action: string | string[]): boolean => {
        if (typeof action === 'string') {
            return userPermissions.some((permission) => permission.resource === resource && permission.action === action);
        }
        return userPermissions.some((permission) => permission.resource === resource && action.includes(permission.action));
    };

    return pruneOrphanContentManagementSection(cleanEmptySections(filterMenuByPermissions(sidebarMenu, mockHasPermission)));
};
