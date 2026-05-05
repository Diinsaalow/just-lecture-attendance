import { AbilityBuilder, PureAbility } from '@casl/ability';
import { IUser, IRole, IAbilityRule } from '../../types/auth';

// Define the subjects that can be acted upon
export type Subjects = string;
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Create the ability type
export type AppAbility = PureAbility<[Actions, Subjects]>;

function isAdminRole(user: IUser): boolean {
    if (typeof user.role === 'string') {
        return user.role.toLowerCase() === 'admin';
    }
    const role = user.role as IRole | undefined;
    return !!(role?.name && role.name.toLowerCase() === 'admin');
}

function isLectureRole(user: IUser): boolean {
    if (typeof user.role === 'string') {
        return user.role.toLowerCase() === 'lecture';
    }
    const role = user.role as IRole | undefined;
    return !!(role?.name && role.name.toLowerCase() === 'lecture');
}

// Create ability from user permissions
export function createAbilityForUser(user: IUser | null): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    if (!user) {
        // Guest user - no permissions
        return build();
    }

    // Admin panel: full access until per-role abilities are wired to the API
    if (isAdminRole(user)) {
        can('manage', 'all');
        return build();
    }

    if (isLectureRole(user)) {
        can('manage', 'AcademicSetup');
    }

    // Non-admin: CASL rules from populated role (when present)
    if (typeof user.role === 'object' && user.role?.ability?.length) {
        const role = user.role as IRole;

        role.ability.forEach((rule: IAbilityRule) => {
            const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
            actions.forEach((action) => {
                can(action as Actions, rule.subject as Subjects);
            });
        });
    }

    return build();
}

// Check if user can perform action on subject
export function canUserPerformAction(user: IUser | null, action: Actions, subject: Subjects): boolean {
    const ability = createAbilityForUser(user);
    return ability.can(action, subject);
}
