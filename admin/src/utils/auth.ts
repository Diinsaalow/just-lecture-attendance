import { sidebarMenu, filterMenuByPermissions, cleanEmptySections } from '../lib/sidebar';
import { IUser } from '../types/auth';
import { MenuItem } from '../types/sidebar';

/**
 * Find the first accessible page from sidebar menu based on user permissions
 * @param user - The user object with role and permissions
 * @param hasPermission - Function to check user permissions (from usePermission hook)
 * @returns The path of the first accessible page, defaults to '/'
 */
const findFirstAccessiblePage = (user: IUser | null, hasPermission: (resource: string, action: string | string[]) => boolean): string => {
    if (!user) {
        return '/'; // Default for unauthenticated users
    }

    // Filter sidebar menu based on user permissions
    const filteredMenu = cleanEmptySections(filterMenuByPermissions(sidebarMenu, hasPermission));

    // Find the first page with a path
    const findFirstPage = (items: MenuItem[]): string | null => {
        for (const item of items) {
            // Skip sections (they don't have paths)
            if (item.isSection) {
                continue;
            }

            // If item has a path, return it
            if (item.path) {
                return item.path;
            }

            // If item has children, check them recursively
            if (item.children && item.children.length > 0) {
                const childPath = findFirstPage(item.children);
                if (childPath) {
                    return childPath;
                }
            }
        }
        return null;
    };

    const firstPage = findFirstPage(filteredMenu);
    return firstPage || '/'; // Fallback to root if no accessible page found
};

export const authUtils = {
    getHomePage: (user: IUser | null, hasPermission: (resource: string, action: string | string[]) => boolean): string => {
        return findFirstAccessiblePage(user, hasPermission);
    },
};
