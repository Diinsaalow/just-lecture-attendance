import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { IFaculty } from '../../../types/faculty';
import FacultyForm from './FacultyForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IFaculty | null;
}

const FacultyModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Faculty' : 'New Faculty'} maxWidth="lg">
        <FacultyForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default FacultyModal;
