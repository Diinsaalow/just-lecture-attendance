import React from 'react';
import GenericModal from '../../../components/GenericModal';
import CampaignForm from './CampaignForm';
import { ICampaign } from '../../../types/campaign';

interface CampaignModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    campaignToEdit?: ICampaign | null;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, setIsOpen, campaignToEdit }) => {
    return (
        <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={campaignToEdit ? 'Edit Campaign' : 'New Campaign'} maxWidth="lg">
            <CampaignForm campaignToEdit={campaignToEdit} onClose={() => setIsOpen(false)} />
        </GenericModal>
    );
};

export default CampaignModal;
