import React from 'react';
import GenericModal from '../../../components/GenericModal';
import LocationForm from './LocationForm';
import { ILocation } from '../../../types/location';

interface LocationModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    locationToEdit?: ILocation | null;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, setIsOpen, locationToEdit }) => {
    return (
        <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={locationToEdit ? 'Edit Location' : 'New Location'} maxWidth="lg">
            <LocationForm locationToEdit={locationToEdit} onClose={() => setIsOpen(false)} />
        </GenericModal>
    );
};

export default LocationModal;
