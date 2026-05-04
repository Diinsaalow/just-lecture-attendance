import { useAuth } from './useAuth';
import { canUserPerformAction, Actions, Subjects } from '../lib/casl';

export const usePermission = () => {
    const { user } = useAuth();

    const hasPermission = (resource: string, action: string | string[]): boolean => {
        // Convert resource and action to CASL types
        const subject = resource as Subjects;
        const actions = Array.isArray(action) ? action : [action];

        // Check if user can perform any of the required actions
        return actions.some((act) => {
            const caslAction = act as Actions;
            return canUserPerformAction(user, caslAction, subject);
        });
    };

    // Helper function to check specific CASL actions
    const can = (action: Actions, subject: Subjects): boolean => {
        return canUserPerformAction(user, action, subject);
    };

    // Helper function to check multiple actions
    const canAny = (actions: Actions[], subject: Subjects): boolean => {
        return actions.some((action) => canUserPerformAction(user, action, subject));
    };

    // Helper function to check all actions
    const canAll = (actions: Actions[], subject: Subjects): boolean => {
        return actions.every((action) => canUserPerformAction(user, action, subject));
    };

    return {
        hasPermission,
        can,
        canAny,
        canAll,
        user,
    };
};
