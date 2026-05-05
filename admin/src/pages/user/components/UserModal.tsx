import React from 'react';
import { IUser } from '../../../types/auth';
import UserForm from './UserForm';
import GenericModal from '../../../components/GenericModal';

interface UserModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    userToEdit?: IUser | null;
}

// ---------------------- Component ----------------------
const UserModal: React.FC<UserModalProps> = ({ isOpen, setIsOpen, userToEdit }) => {
    const isEditMode = Boolean(userToEdit);

    return (
        <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={isEditMode ? 'Edit User' : 'New User'} maxWidth="3xl">
            <UserForm userToEdit={userToEdit} onClose={() => setIsOpen(false)} />
        </GenericModal>
    );
};

export default UserModal;
