import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { ISemester } from '../../../types/semester';
import SemesterForm from './SemesterForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: ISemester | null;
}

const SemesterModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Semester' : 'New Semester'} maxWidth="lg">
        <SemesterForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default SemesterModal;
