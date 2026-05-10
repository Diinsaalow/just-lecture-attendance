import React from 'react';
import GenericSidebar from '../../../../components/GenericSidebar';
import RoleForm from './RoleForm';
import { IRole } from '../../../../types';

interface RoleModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    roleToEdit?: IRole | null;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, setIsOpen, roleToEdit }) => {
    return (
        <GenericSidebar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={roleToEdit ? 'Edit Role' : 'New Role'}
            width="min(100vw, 36rem)"
            closeButtonPosition="top-right"
        >
            <RoleForm roleToEdit={roleToEdit} onClose={() => setIsOpen(false)} />
        </GenericSidebar>
    );
};

export default RoleModal;
