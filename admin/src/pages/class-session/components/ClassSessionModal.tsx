import React from 'react';
import GenericSidebar from '../../../components/GenericSidebar';
import type { IClassSession } from '../../../types/classSession';
import ClassSessionForm from './ClassSessionForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IClassSession | null;
}

const ClassSessionModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={itemToEdit ? 'Edit Class Session' : 'New Class Session'}
        width="min(100vw, 42rem)"
        closeButtonPosition="top-right"
    >
        <ClassSessionForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericSidebar>
);

export default ClassSessionModal;
