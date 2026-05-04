import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import FormDatePicker from '../../../components/form/FormDatePicker';
import { useCreateCampaignMutation, useUpdateCampaignMutation } from '../../../store/api/campaignApi';
import { ICampaign } from '../../../types/campaign';

const campaignSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    targetAudienceSize: z.coerce.number().int('Size must be an integer').min(1, 'Size must be at least 1'),
    status: z.enum(['active', 'inactive', 'paused', 'completed']),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
    campaignToEdit?: ICampaign | null;
    onClose: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ campaignToEdit, onClose }) => {
    const isEditMode = Boolean(campaignToEdit);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CampaignFormData>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            targetAudienceSize: 0,
            status: 'active',
        },
    });

    const [createCampaign] = useCreateCampaignMutation();
    const [updateCampaign] = useUpdateCampaignMutation();

    useEffect(() => {
        if (campaignToEdit) {
            reset({
                name: campaignToEdit.name,
                description: campaignToEdit.description || '',
                startDate: campaignToEdit.startDate.split('T')[0], // simple date formatting
                endDate: campaignToEdit.endDate.split('T')[0],
                targetAudienceSize: campaignToEdit.targetAudienceSize,
                status: campaignToEdit.status,
            });
        }
    }, [campaignToEdit, reset]);

    const onSubmit = async (data: CampaignFormData) => {
        try {
            const payload = {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            };

            if (isEditMode && campaignToEdit) {
                await updateCampaign({ id: campaignToEdit._id, data: payload }).unwrap();
                toast.success('Campaign updated successfully');
            } else {
                await createCampaign(payload).unwrap();
                toast.success('Campaign created successfully');
            }
            onClose();
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || 'An error occurred');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="name"
                        type="text"
                        label="Campaign Name"
                        error={errors.name?.message}
                        placeholder="Enter campaign name"
                        disabled={isSubmitting}
                        {...field}
                    />
                )}
            />

            <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="description"
                        type="textarea"
                        label="Description"
                        error={errors.description?.message}
                        placeholder="Enter description"
                        disabled={isSubmitting}
                        {...field}
                        value={field.value || ''}
                    />
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                        <FormDatePicker
                            id="startDate"
                            label="Start Date"
                            error={errors.startDate?.message}
                            disabled={isSubmitting}
                            value={field.value}
                            onChange={(dates) => {
                                const date = dates[0];
                                field.onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '');
                            }}
                        />
                    )}
                />
                <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                        <FormDatePicker
                            id="endDate"
                            label="End Date"
                            error={errors.endDate?.message}
                            disabled={isSubmitting}
                            value={field.value}
                            onChange={(dates) => {
                                const date = dates[0];
                                field.onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '');
                            }}
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="targetAudienceSize"
                    control={control}
                    render={({ field }) => (
                        <FormInput
                            id="targetAudienceSize"
                            type="number"
                            label="Target Audience Size"
                            error={errors.targetAudienceSize?.message}
                            disabled={isSubmitting}
                            {...field}
                            value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                            onChange={(val) => field.onChange(val)}
                            min="1"
                        />
                    )}
                />

                <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                        <FormSelect
                            id="status"
                            label="Status"
                            error={errors.status?.message}
                            disabled={isSubmitting}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'paused', label: 'Paused' },
                                { value: 'completed', label: 'Completed' },
                            ]}
                            {...field}
                        />
                    )}
                />
            </div>

            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? 'Updating...' : 'Saving...'}
                    displayText={isEditMode ? 'Update' : 'Save'}
                    className="ltr:ml-4 rtl:mr-4"
                />
            </div>
        </form>
    );
};

export default CampaignForm;
