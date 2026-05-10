import React from 'react';
import GenericModal from './GenericModal';

interface Props {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onDelete: () => void | Promise<void>;
    isDeleting?: boolean;
}

const DeleteModal: React.FC<Props> = ({ isOpen, setIsOpen, onDelete, isDeleting }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title="Confirm delete" maxWidth="md">
        <p className="mb-4 text-white-dark">Are you sure? This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline-primary" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={() => void onDelete()} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    </GenericModal>
);

export default DeleteModal;
