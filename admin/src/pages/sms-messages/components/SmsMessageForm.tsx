
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import GenericModal from '../../../components/GenericModal';
import FormInput from '../../../components/form/FormInput';
import FormTextarea from '../../../components/form/FormTextarea';
import FormSelect from '../../../components/form/FormSelect';
import FormDatePicker from '../../../components/form/FormDatePicker';
import FormSwitch from '../../../components/form/FormSwitch';
import TargetSelector from './TargetSelector';
import { ISmsMessage, SmsMessageType } from '../../../types/smsMessage';
import { useCreateSmsMessageMutation, useUpdateSmsMessageMutation, useAddTargetMutation, useGetTargetsQuery } from '../../../store/api/smsMessageApi';
import { useGetAllCampaignsQuery } from '../../../store/api/campaignApi';
import { toast } from 'sonner';

interface SmsMessageFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    messageToEdit?: ISmsMessage | null;
}

import FormTimePicker from '../../../components/form/FormTimePicker';

export interface SmsMessageFormData {
    campaign: string;
    content: string;
    messageType: SmsMessageType;
    scheduleDate: string;
    scheduleTime: string;
    isActive: boolean;
    targetAll: boolean;
    locations: string[];
    groups: string[];
    recipients: string[];
    onlyOptedIn: boolean;
    onlyActive: boolean;
}

const SmsMessageForm: React.FC<SmsMessageFormProps> = ({ isOpen, setIsOpen, messageToEdit }) => {
    const [step, setStep] = useState(1);
    const [createdMessageId, setCreatedMessageId] = useState<string | null>(null);

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SmsMessageFormData>({
        defaultValues: {
            campaign: '',
            content: '',
            messageType: SmsMessageType.EDUCATION,
            scheduleDate: '',
            scheduleTime: '',
            isActive: true,
            // Targets
            targetAll: false,
            locations: [],
            groups: [],
            recipients: [],
            onlyOptedIn: true,
            onlyActive: true
        }
    });

    // API Hooks
    const [createMessage, { isLoading: isCreating }] = useCreateSmsMessageMutation();
    const [updateMessage, { isLoading: isUpdating }] = useUpdateSmsMessageMutation();
    const [addTarget, { isLoading: isAddingTarget }] = useAddTargetMutation();
    const { data: campaignsData, isLoading: isLoadingCampaigns } = useGetAllCampaignsQuery({});

    // Fetch existing targets if editing
    const { data: existingTargets } = useGetTargetsQuery(messageToEdit?._id || '', {
        skip: !messageToEdit
    });

    const campaignOptions = campaignsData?.docs?.map((c: any) => ({
        value: c._id,
        label: c.name
    })) || [];

    const messageTypeOptions = Object.values(SmsMessageType).map(type => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1)
    }));

    useEffect(() => {
        if (messageToEdit) {
            setValue('campaign', typeof messageToEdit.campaign === 'object' ? messageToEdit.campaign._id : messageToEdit.campaign);
            setValue('content', messageToEdit.content);
            setValue('messageType', messageToEdit.messageType);

            if (messageToEdit.scheduledAt) {
                // Parse ISO or custom format: "2026-02-14T08:25:00.00+03:00" or ISO
                const dt = new Date(messageToEdit.scheduledAt);
                if (!isNaN(dt.getTime())) {
                    const y = dt.getFullYear();
                    const m = String(dt.getMonth() + 1).padStart(2, '0');
                    const d = String(dt.getDate()).padStart(2, '0');
                    const hh = String(dt.getHours()).padStart(2, '0');
                    const mm = String(dt.getMinutes()).padStart(2, '0');

                    setValue('scheduleDate', `${y}-${m}-${d}`);
                    setValue('scheduleTime', `${hh}:${mm}`);
                }
            } else {
                setValue('scheduleDate', '');
                setValue('scheduleTime', '');
            }

            setValue('isActive', messageToEdit.isActive);
            setCreatedMessageId(messageToEdit._id);
        } else {
            reset({
                campaign: '',
                content: '',
                messageType: SmsMessageType.EDUCATION,
                scheduleDate: '',
                scheduleTime: '',
                isActive: true,
                targetAll: false,
                locations: [],
                groups: [],
                recipients: [],
                onlyOptedIn: true,
                onlyActive: true
            });
            setStep(1);
            setCreatedMessageId(null);
        }
    }, [messageToEdit, setValue, reset, isOpen]);

    // Check if we can pre-fill filtering options when editing
    useEffect(() => {
        if (existingTargets && existingTargets.length > 0) {
            const target = existingTargets[0]; // Assuming single target set for simplicity in UI for now
            setValue('targetAll', target.targetAll);
            setValue('locations', (target.locations || []).map((l: any) => typeof l === 'string' ? l : l._id));
            setValue('groups', (target.groups || []).map((g: any) => typeof g === 'string' ? g : g._id));
            setValue('recipients', (target.recipients || []).map((r: any) => typeof r === 'string' ? r : r._id));
            setValue('onlyOptedIn', target.onlyOptedIn);
            setValue('onlyActive', target.onlyActive);
        }
    }, [existingTargets, setValue]);

    const handleClose = () => {
        setIsOpen(false);
        setStep(1);
        setCreatedMessageId(null);
        reset();
    }

    const formatScheduledAt = (date: string, time: string) => {
        if (!date || !time) return undefined;
        // Target format: "2026-02-14T08:25:00.00+03:00"
        return `${date}T${time}:00.00+03:00`;
    };

    const onSubmit = async (data: any) => {
        try {
            let messageId = createdMessageId;
            const scheduledAt = formatScheduledAt(data.scheduleDate, data.scheduleTime);

            // Step 1: Create or Update Message
            if (!messageId) {
                const messagePayload = {
                    campaign: data.campaign,
                    content: data.content,
                    messageType: data.messageType,
                    scheduledAt,
                    isActive: data.isActive
                };

                const result = await createMessage(messagePayload).unwrap();
                messageId = result._id;
                setCreatedMessageId(messageId);
                // If success, move to next step if not already there, but we are submitting everything at once for user convenience
                // Actually, we should probably auto-advance or handle it in one go if UI permits.
                // But since we want to allow "Next" flow, let's see.
                // If we are in Step 1 and user clicked Next (handled separately), we wouldn't be here.
                // This onSubmit is final submission.
            } else {
                if (messageToEdit) {
                    const messagePayload = {
                        campaign: data.campaign,
                        content: data.content,
                        messageType: data.messageType,
                        scheduledAt,
                        isActive: data.isActive
                    };
                    await updateMessage({ id: messageId, data: messagePayload }).unwrap();
                }
            }

            // Step 2: Add Target
            // We always add a new target set (replacing old logic handled by backend if targetAll, or we just append)
            // But for this UI, we treat it as "The Target" for this message.
            // Backend supports multiple targets, but UI might simplify to one set of criteria.
            // Let's assume we clean up old targets or just add this one.
            // Based on service logic: "If targeting all, delete existing targets".
            // For specific targeting, it appends.
            // To be clean, if we are editing, we might want to clear previous targets if user changed them significantly, 
            // but the API addTarget is additive unless targetAll is true.

            // For now, valid use case: Add this target criteria.
            const targetPayload = {
                smsMessage: messageId,
                locations: data.locations,
                groups: data.groups,
                recipients: data.recipients,
                targetAll: data.targetAll,
                onlyOptedIn: data.onlyOptedIn,
                onlyActive: data.onlyActive
            };

            await addTarget({ id: messageId, data: targetPayload }).unwrap();

            toast.success(messageToEdit ? 'SMS Message updated successfully' : 'SMS Message created and scheduled successfully');
            handleClose();

        } catch (error: any) {
            console.error(error);
            toast.error(error?.data?.message || error.message || 'Failed to save SMS message');
        }
    };

    const handleNext = async () => {
        // Trigger validation for first step fields
        // We can just basic validate here or accept partial data if we want to save draft.
        // Let's safe draft (create message) then move to step 2.
        const values = watch();
        if (!values.campaign || !values.content || !values.messageType) {
            toast.error('Please fill in all required fields (Campaign, Content, Type)');
            return;
        }

        try {
            const scheduledAt = formatScheduledAt(values.scheduleDate, values.scheduleTime);
            if (!createdMessageId) {
                const messagePayload = {
                    campaign: values.campaign,
                    content: values.content,
                    messageType: values.messageType,
                    scheduledAt,
                    isActive: values.isActive
                };
                const result = await createMessage(messagePayload).unwrap();
                setCreatedMessageId(result._id);
                toast.success('Draft message created. Please configure targeting.');
            } else {
                // Update existing draft
                const messagePayload = {
                    campaign: values.campaign,
                    content: values.content,
                    messageType: values.messageType,
                    scheduledAt,
                    isActive: values.isActive
                };
                await updateMessage({ id: createdMessageId, data: messagePayload }).unwrap();
            }
            setStep(2);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save draft');
        }
    };

    return (
        <GenericModal
            title={messageToEdit ? 'Edit SMS Message' : 'Create SMS Message'}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Stepper / Tabs */}
                <div className="flex border-b mb-4 gap-3 py-2">
                    <button
                        type="button"
                        className={`py-2 px-4 btn btn-outline  shadow-none font-medium text-sm transition-colors duration-200 ${step === 1 ? 'btn-primary text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setStep(1)}
                    >
                        1. Message Details
                    </button>
                    <button
                        type="button"
                        className={`py-2 px-4 btn btn-outline shadow-none font-medium text-sm transition-colors duration-200 ${step === 2 ? 'btn-primary text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => createdMessageId ? setStep(2) : toast.error('Please save message details first')}
                        disabled={!createdMessageId}
                    >
                        2. Targeting
                    </button>
                </div>


                {step === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <Controller
                            name="campaign"
                            control={control}
                            rules={{ required: 'Campaign is required' }}
                            render={({ field }) => (
                                <FormSelect
                                    id="campaign"
                                    label="Campaign"
                                    options={campaignOptions}
                                    // placeholder="Select Campaign"
                                    error={errors.campaign?.message}
                                    disabled={isLoadingCampaigns}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="content"
                            control={control}
                            rules={{ required: 'Content is required' }}
                            render={({ field }) => (
                                <FormTextarea
                                    id="content"
                                    label="Message Content"
                                    placeholder="Enter SMS content..."
                                    rows={4}
                                    error={errors.content?.message}
                                    {...field}
                                    value={field.value || ''}
                                />
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="scheduleDate"
                                control={control}
                                render={({ field }) => (
                                    <FormDatePicker
                                        id="scheduleDate"
                                        label="Schedule Date (Optional)"
                                        value={field.value}
                                        onChange={(date) => {
                                            const d = Array.isArray(date) ? date[0] : date;
                                            if (d) {
                                                const year = d.getFullYear();
                                                const month = String(d.getMonth() + 1).padStart(2, '0');
                                                const day = String(d.getDate()).padStart(2, '0');
                                                field.onChange(`${year}-${month}-${day}`);
                                            } else {
                                                field.onChange('');
                                            }
                                        }}
                                        options={{
                                            enableTime: false,
                                            dateFormat: 'Y-m-d',
                                            minDate: 'today'
                                        }}
                                    />
                                )}
                            />

                            <Controller
                                name="scheduleTime"
                                control={control}
                                render={({ field }) => (
                                    <FormTimePicker
                                        id="scheduleTime"
                                        label="Schedule Time"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="messageType"
                                control={control}
                                rules={{ required: 'Type is required' }}
                                render={({ field }) => (
                                    <FormSelect
                                        id="messageType"
                                        label="Message Type"
                                        options={messageTypeOptions}
                                        error={errors.messageType?.message}
                                        {...field}
                                    />
                                )}
                            />

                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <FormSwitch
                                        id="isActive"
                                        label="Active Status"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                        <TargetSelector control={control} errors={errors} />

                    </div>
                )}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>

                    {step === 1 ? (
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={isCreating || isUpdating}
                        >
                            {isCreating || isUpdating ? 'Saving...' : 'Next: Targeting'}
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => setStep(1)}
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isAddingTarget}
                            >
                                {isAddingTarget ? 'Saving...' : 'Save & Schedule'}
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </GenericModal>
    );
};

export default SmsMessageForm;
