import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { IDepartment } from '../../../types/department';
import DepartmentForm from './DepartmentForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IDepartment | null;
}

const DepartmentModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Department' : 'New Department'} maxWidth="2xl">
        <DepartmentForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default DepartmentModal;
