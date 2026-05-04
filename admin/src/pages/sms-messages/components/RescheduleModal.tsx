import React, { useState } from 'react';
import { useRescheduleSmsMessageMutation } from '../../../store/api/smsMessageApi';
import GenericModal from '../../../components/GenericModal';
import FormDatePicker from '../../../components/form/FormDatePicker';
import FormTimePicker from '../../../components/form/FormTimePicker';
import { ISmsMessage } from '../../../types/smsMessage';
import { toast } from 'sonner';

interface RescheduleModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    message: ISmsMessage | null;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, setIsOpen, message }) => {
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [rescheduleMessage, { isLoading }] = useRescheduleSmsMessageMutation();

    const handleClose = () => {
        setIsOpen(false);
        setScheduleDate('');
        setScheduleTime('');
    };

    const formatScheduledAt = (date: string, time: string) => {
        if (!date || !time) return '';
        // Same format as SmsMessageForm
        return `${date}T${time}:00.00+03:00`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) return;
        if (!scheduleDate || !scheduleTime) {
            toast.error('Please select both date and time');
            return;
        }

        try {
            const scheduledAt = formatScheduledAt(scheduleDate, scheduleTime);
            await rescheduleMessage({
                id: message._id,
                data: { scheduledAt }
            }).unwrap();

            toast.success('Message rescheduled successfully');
            handleClose();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to reschedule message');
        }
    };

    return (
        <GenericModal
            title="Reschedule Message"
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will duplicate the selected message and its targets with a new scheduled date.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <FormDatePicker
                        id="rescheduleDate"
                        label="New Schedule Date"
                        value={scheduleDate}
                        onChange={(date) => {
                            const d = Array.isArray(date) ? date[0] : date;
                            if (d) {
                                const year = d.getFullYear();
                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                const day = String(d.getDate()).padStart(2, '0');
                                setScheduleDate(`${year}-${month}-${day}`);
                            } else {
                                setScheduleDate('');
                            }
                        }}
                        options={{
                            enableTime: false,
                            dateFormat: 'Y-m-d',
                            minDate: 'today'
                        }}
                    />

                    <FormTimePicker
                        id="rescheduleTime"
                        label="New Schedule Time"
                        value={scheduleTime}
                        onChange={setScheduleTime}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </button>
                </div>
            </form>
        </GenericModal>
    );
};

export default RescheduleModal;
