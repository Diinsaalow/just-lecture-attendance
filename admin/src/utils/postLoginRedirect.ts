import type { IUser, IRole } from '../types/auth';

const ADMIN_ROLE = 'admin';

function normalizeRoleName(role: IUser['role'] | undefined): string {
    if (!role) return '';
    if (typeof role === 'string') return role.toLowerCase();
    const named = role as IRole;
    if (named?.name && typeof named.name === 'string') return named.name.toLowerCase();
    return '';
}

/** Where to send the user after a successful auth callback (login / 2FA). */
export function getPostLoginPath(role: IUser['role'] | undefined, redirectPath: string): string {
    const r = normalizeRoleName(role);
    const raw = redirectPath?.trim() || '/';
    const isSafeInternal = raw.startsWith('/') && !raw.startsWith('//') && !raw.includes(':');

    if (r === ADMIN_ROLE) {
        if (raw !== '/' && isSafeInternal) {
            return raw;
        }
        return '/dashboard/system';
    }

    return raw;
}

export function isAdminRole(role: IUser['role'] | undefined): boolean {
    return normalizeRoleName(role) === ADMIN_ROLE;
}
