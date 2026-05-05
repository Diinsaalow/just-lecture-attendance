import React from 'react';
import GenericModal from '../../../../components/GenericModal';
import { useAuth } from '../../../../hooks/useAuth';
import { usePreviewNextUsernameQuery } from '../../../../store/api/lecturerApi';
import type { IUser } from '../../../../types/auth';
import LecturerForm from './LecturerForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: IUser | null;
}

const LecturerModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => {
    const { user } = useAuth();
    const isEdit = Boolean(itemToEdit);
    const { data: preview } = usePreviewNextUsernameQuery(undefined, {
        skip: !isOpen || isEdit,
    });

    return (
        <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={isEdit ? 'Edit lecturer' : 'New lecturer'} maxWidth="2xl">
            <LecturerForm itemToEdit={itemToEdit} suggestedUsername={preview?.username} onClose={() => setIsOpen(false)} currentUser={user} />
        </GenericModal>
    );
};

export default LecturerModal;
