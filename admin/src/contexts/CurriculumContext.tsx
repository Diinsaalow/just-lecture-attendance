import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ICurriculum } from '../types/curriculum';

interface CurriculumContextType {
    selectedCurriculum: ICurriculum | null;
    setSelectedCurriculum: (curriculum: ICurriculum | null) => void;
    clearSelectedCurriculum: () => void;
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined);

interface CurriculumProviderProps {
    children: ReactNode;
}

export const CurriculumProvider: React.FC<CurriculumProviderProps> = ({ children }) => {
    const [selectedCurriculum, setSelectedCurriculum] = useState<ICurriculum | null>(null);

    // Load selected curriculum from localStorage on mount
    useEffect(() => {
        const savedCurriculumId = localStorage.getItem('selectedCurriculumId');
        if (savedCurriculumId) {
            // We'll let the QuickLinks component handle loading the actual curriculum data
            // This just ensures we have the ID available
        }
    }, []);

    const clearSelectedCurriculum = () => {
        setSelectedCurriculum(null);
        localStorage.removeItem('selectedCurriculumId');
    };

    const value: CurriculumContextType = {
        selectedCurriculum,
        setSelectedCurriculum,
        clearSelectedCurriculum,
    };

    return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
};

export const useCurriculum = (): CurriculumContextType => {
    const context = useContext(CurriculumContext);
    if (context === undefined) {
        throw new Error('useCurriculum must be used within a CurriculumProvider');
    }
    return context;
};
