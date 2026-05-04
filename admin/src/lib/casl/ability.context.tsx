import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, createAbilityForUser } from './ability.factory';
import { IUser } from '../../types/auth';

// Create the ability context for the Can component (never undefined)
const AbilityContext = createContext<AppAbility>(createAbilityForUser(null));

// Create the extended context for additional functionality
interface AbilityContextType {
    ability: AppAbility;
    updateAbility: (user: IUser | null) => void;
}

const ExtendedAbilityContext = createContext<AbilityContextType | undefined>(undefined);

// Provider component
interface AbilityProviderProps {
    children: ReactNode;
    user: IUser | null;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ children, user }) => {
    const [ability, setAbility] = React.useState<AppAbility>(() => createAbilityForUser(user));

    const updateAbility = (newUser: IUser | null) => {
        const newAbility = createAbilityForUser(newUser);
        setAbility(newAbility);
    };

    // Update ability when user changes
    useEffect(() => {
        updateAbility(user);
    }, [user]);

    const extendedValue: AbilityContextType = {
        ability,
        updateAbility,
    };

    return (
        <ExtendedAbilityContext.Provider value={extendedValue}>
            <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
        </ExtendedAbilityContext.Provider>
    );
};

// Hook to use the extended ability context
export const useAbility = (): AbilityContextType => {
    const context = useContext(ExtendedAbilityContext);
    if (context === undefined) {
        throw new Error('useAbility must be used within an AbilityProvider');
    }
    return context;
};

// Create the Can component using @casl/react
export const Can = createContextualCan(AbilityContext.Consumer);
