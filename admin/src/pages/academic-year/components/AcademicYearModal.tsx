import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { IAcademicYear } from '../../../types/academicYear';
import AcademicYearForm from './AcademicYearForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IAcademicYear | null;
}

const AcademicYearModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Academic Year' : 'New Academic Year'} maxWidth="lg">
        <AcademicYearForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default AcademicYearModal;
