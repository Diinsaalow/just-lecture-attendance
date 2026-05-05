import React from 'react';
import GenericSidebar from '../../../components/GenericSidebar';
import type { IPeriod } from '../../../types/period';
import PeriodForm from './PeriodForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IPeriod | null;
}

/** Same right-slide panel pattern as Settings → Roles (GenericSidebar). */
const PeriodModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={itemToEdit ? 'Edit Period' : 'New Period'}
        width="min(100vw, 48rem)"
        closeButtonPosition="top-right"
    >
        <PeriodForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericSidebar>
);

export default PeriodModal;
