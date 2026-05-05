import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { ICampus } from '../../../types/campus';
import CampusForm from './CampusForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: ICampus | null;
}

const CampusModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Campus' : 'New Campus'} maxWidth="lg">
        <CampusForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default CampusModal;
