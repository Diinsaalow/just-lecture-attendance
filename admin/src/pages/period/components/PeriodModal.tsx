import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { IPeriod } from '../../../types/period';
import PeriodForm from './PeriodForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IPeriod | null;
}

const PeriodModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Period' : 'New Period'} maxWidth="2xl">
        <PeriodForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default PeriodModal;
