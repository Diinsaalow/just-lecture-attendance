import React, { createContext, useContext, ReactNode } from 'react';

interface ModalContextType {
    openModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

interface ModalProviderProps {
    children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const openModal = () => {
        // Placeholder for modal functionality
        console.log('Modal opened');
    };

    return <ModalContext.Provider value={{ openModal }}>{children}</ModalContext.Provider>;
};
