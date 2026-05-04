import React, { createContext, useContext } from 'react';

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '' }) => {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={`w-full ${className}`}>{children}</div>
        </TabsContext.Provider>
    );
};

const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
    return <div className={`flex space-x-1 ${className}`}>{children}</div>;
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsTrigger must be used within a Tabs component');
    }

    const { value: activeValue, onValueChange } = context;
    const isActive = value === activeValue;

    return (
        <button
            onClick={() => onValueChange(value)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-200 ${
                isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            } ${className}`}
        >
            {children}
        </button>
    );
};

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsContent must be used within a Tabs component');
    }

    const { value: activeValue } = context;
    if (value !== activeValue) {
        return null;
    }

    return <div className={`${className}`}>{children}</div>;
};

// Export the components
export { Tabs, TabsContent, TabsList, TabsTrigger };
