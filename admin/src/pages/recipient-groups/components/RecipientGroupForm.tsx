
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import GenericModal from '../../../components/GenericModal';
import FormInput from '../../../components/form/FormInput';
import FormTextarea from '../../../components/form/FormTextarea';
import FormMultiSelect from '../../../components/form/FormMultiSelect';
import FormSwitch from '../../../components/form/FormSwitch';
import { IRecipientGroup } from '../../../types/recipientGroup';
import { useCreateRecipientGroupMutation, useUpdateRecipientGroupMutation } from '../../../store/api/recipientGroupApi';
import { useGetAllRecipientsQuery } from '../../../store/api/recipientApi';
import { toast } from 'sonner';

interface RecipientGroupFormProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    groupToEdit?: IRecipientGroup | null;
}

interface RecipientGroupFormData {
    name: string;
    description?: string;
    recipients: string[];
    isActive: boolean;
}

const RecipientGroupForm: React.FC<RecipientGroupFormProps> = ({ isOpen, setIsOpen, groupToEdit }) => {
    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<RecipientGroupFormData>({
        defaultValues: {
            name: '',
            description: '',
            isActive: true,
            recipients: []
        }
    });

    // API Hooks
    const [createGroup, { isLoading: isCreating }] = useCreateRecipientGroupMutation();
    const [updateGroup, { isLoading: isUpdating }] = useUpdateRecipientGroupMutation();
    const { data: recipientsData, isLoading: isLoadingRecipients } = useGetAllRecipientsQuery({});

    const recipientsOptions = recipientsData?.docs?.map((r: any) => ({
        value: r._id,
        label: `${r.phoneNumber} (${r.languageCode})`
    })) || [];

    useEffect(() => {
        if (groupToEdit) {
            setValue('name', groupToEdit.name);
            setValue('description', groupToEdit.description);
            setValue('isActive', groupToEdit.isActive);
            // Ensure recipients is array of strings
            const recipientIds = groupToEdit.recipients.map((r: any) => typeof r === 'string' ? r : r._id);
            setValue('recipients', recipientIds);
        } else {
            reset({
                name: '',
                description: '',
                isActive: true,
                recipients: []
            });
        }
    }, [groupToEdit, setValue, reset, isOpen]);

    const onSubmit = async (data: RecipientGroupFormData) => {
        try {
            if (groupToEdit) {
                await updateGroup({ id: groupToEdit._id, data }).unwrap();
                toast.success('Recipient Group updated successfully');
            } else {
                await createGroup(data).unwrap();
                toast.success('Recipient Group created successfully');
            }
            setIsOpen(false);
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || error.message || 'Failed to save recipient group');
        }
    };

    return (
        <GenericModal
            title={groupToEdit ? 'Edit Recipient Group' : 'Add Recipient Group'}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                        <FormInput
                            id="name"
                            label="Name"
                            placeholder="Enter group name"
                            error={errors.name?.message}
                            {...field}
                        />
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <FormTextarea
                            id="description"
                            label="Description"
                            placeholder="Enter description"
                            error={errors.description?.message}
                            {...field}
                            value={field.value || ''}
                        />
                    )}
                />

                <Controller
                    name="recipients"
                    control={control}
                    render={({ field }) => (
                        <FormMultiSelect
                            id="recipients"
                            label="Recipients"
                            placeholder="Select recipients"
                            options={recipientsOptions}
                            value={field.value || []}
                            onChange={field.onChange}
                            disabled={isLoadingRecipients}
                            error={errors.recipients?.message}
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

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isCreating || isUpdating}
                    >
                        {isCreating || isUpdating ? 'Saving...' : groupToEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </GenericModal>
    );
};

export default RecipientGroupForm;
