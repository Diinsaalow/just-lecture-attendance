import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { IHall } from '../../../types/hall';
import HallForm from './HallForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IHall | null;
}

const HallModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Hall' : 'New Hall'} maxWidth="lg">
        <HallForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default HallModal;
