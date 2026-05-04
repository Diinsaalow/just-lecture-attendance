import { AbilityBuilder, PureAbility } from '@casl/ability';
import { IUser, IRole, IAbilityRule } from '../../types/auth';

// Define the subjects that can be acted upon
export type Subjects = string;
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Create the ability type
export type AppAbility = PureAbility<[Actions, Subjects]>;

// Create ability from user permissions
export function createAbilityForUser(user: IUser | null): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    if (!user) {
        // Guest user - no permissions
        return build();
    }

    // If user has a role object with abilities
    if (typeof user.role === 'object' && user.role.ability) {
        const role = user.role as IRole;

        role.ability.forEach((rule: IAbilityRule) => {
            const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
            actions.forEach((action) => {
                can(action as Actions, rule.subject as Subjects);
            });
        });
    }

    // If user has a role string, we could add role-based permissions here
    // For now, we'll rely on the explicit ability rules

    return build();
}

// Check if user can perform action on subject
export function canUserPerformAction(user: IUser | null, action: Actions, subject: Subjects): boolean {
    const ability = createAbilityForUser(user);
    return ability.can(action, subject);
}
