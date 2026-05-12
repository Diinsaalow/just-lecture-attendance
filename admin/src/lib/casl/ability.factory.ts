import { AbilityBuilder, PureAbility } from '@casl/ability';
import { IUser, IRole, IAbilityRule } from '../../types/auth';

export type Subjects = string;
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

export type AppAbility = PureAbility<[Actions, Subjects]>;

function normalizeRole(name: string): string {
    return name.toLowerCase();
}

function isSuperAdminRole(user: IUser): boolean {
    if (typeof user.role === 'string') {
        return normalizeRole(user.role) === 'super-admin';
    }
    const role = user.role as IRole | undefined;
    const nm = role?.name?.toLowerCase();
    return nm === 'super-admin';
}

/** Rules from API `/auth/login` → `user.abilities`, or role document when populated. */
function rulesFromUser(user: IUser): IAbilityRule[] {
    if (typeof user.role === 'object' && user.role?.ability?.length) {
        return user.role.ability;
    }
    if (user.abilities?.length) {
        return user.abilities;
    }
    return [];
}

export function createAbilityForUser(user: IUser | null): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    if (!user) {
        return build();
    }

    const explicit = rulesFromUser(user);
    if (explicit.length > 0) {
        explicit.forEach((rule: IAbilityRule) => {
            const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
            actions.forEach((action) => {
                can(action as Actions, rule.subject as Subjects);
            });
        });
        return build();
    }

    const n = typeof user.role === 'string' ? normalizeRole(user.role) : normalizeRole((user.role as IRole)?.name ?? '');

    if (isSuperAdminRole(user)) {
        can('manage', 'all');
        return build();
    }

    if (n === 'faculty-admin') {
        can('manage', 'AcademicSetup');
        can('manage', 'Hall');
        can('manage', 'Period');
        can('manage', 'ClassSession');
        can('read', 'Dashboard');
        can('read', 'Report');
        can('read', 'User');
        can('create', 'User');
        can('update', 'User');
        can('delete', 'User');
        can('read', 'Role');
        can('read', 'Settings');
        can('read', 'AttendanceRecord');
        can('update', 'AttendanceRecord');
        can('manage', 'AttendanceSettings');
        can('read', 'BoundDevice');
        can('delete', 'BoundDevice');
        can('read', 'AbsenceSubmission');
        can('update', 'AbsenceSubmission');
        can('read', 'AuditLog');
        return build();
    }

    if (n === 'instructor') {
        /** Instructor abilities mirror the mobile-app surface only; admin UI gates further. */
        can('read', 'AcademicSetup');
        can('read', 'Hall');
        can('read', 'Period');
        can('read', 'ClassSession');
        can('read', 'Dashboard');
        can('read', 'AttendanceRecord');
        can('create', 'AttendanceRecord');
        can('create', 'BoundDevice');
        can('read', 'BoundDevice');
        can('create', 'AbsenceSubmission');
        can('read', 'AbsenceSubmission');
        return build();
    }

    return build();
}

export function canUserPerformAction(user: IUser | null, action: Actions, subject: Subjects): boolean {
    const ability = createAbilityForUser(user);
    if (ability.can('manage', 'all')) {
        return true;
    }
    return ability.can(action, subject);
}
