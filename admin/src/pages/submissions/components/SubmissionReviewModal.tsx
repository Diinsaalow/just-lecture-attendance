import React, { useEffect, useState } from 'react';
import ActionButton from '../../../components/ActionButton';
import GenericModal from '../../../components/GenericModal';

interface Props {
    open: boolean;
    action: 'approve' | 'reject';
    loading: boolean;
    onClose: () => void;
    onSubmit: (note: string) => void;
}

const SubmissionReviewModal: React.FC<Props> = ({
    open,
    action,
    loading,
    onClose,
    onSubmit,
}) => {
    const [note, setNote] = useState('');
    useEffect(() => {
        if (open) setNote('');
    }, [open]);

    const title = action === 'approve' ? 'Approve submission' : 'Reject submission';

    return (
        <GenericModal isOpen={open} setIsOpen={onClose} title={title} maxWidth="md">
            <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {action === 'approve'
                        ? 'Approving will update the related attendance record (excused or excused-flag) where applicable.'
                        : 'Rejecting leaves the related attendance record untouched.'}
                </p>
                <div>
                    <label className="text-sm font-semibold" htmlFor="review-note">
                        Note (optional)
                    </label>
                    <textarea
                        id="review-note"
                        className="form-textarea mt-1 w-full"
                        rows={4}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note about this decision"
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <ActionButton
                        type="button"
                        variant="outline-danger"
                        onClick={onClose}
                        disabled={loading}
                        displayText="Cancel"
                    />
                    <ActionButton
                        type="button"
                        variant={action === 'approve' ? 'primary' : 'outline-danger'}
                        onClick={() => onSubmit(note)}
                        isLoading={loading}
                        displayText={action === 'approve' ? 'Approve' : 'Reject'}
                    />
                </div>
            </div>
        </GenericModal>
    );
};

export default SubmissionReviewModal;
