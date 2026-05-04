import { GenericModal } from '@/components'
import React from 'react'
import RecipientForm from './RecipientForm'
import { IRecipient } from '@/types/recipient'

interface RecipientModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    recipientToEdit?: IRecipient | null;
}

const RecipientModal: React.FC<RecipientModalProps> = ({ isOpen, setIsOpen, recipientToEdit }) => {
    return (
        <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={recipientToEdit ? 'Edit Recipient' : 'New Recipient'} maxWidth="lg">
            <RecipientForm recipientToEdit={recipientToEdit} onClose={() => setIsOpen(false)} />
        </GenericModal>
    );
}

export default RecipientModal