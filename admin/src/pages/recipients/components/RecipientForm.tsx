import { useCreateRecipientMutation, useUpdateRecipientMutation } from '../../../store/api/recipientApi';
import { IRecipient } from '../../../types/recipient';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface RecipientFormProps {
    recipientToEdit?: IRecipient | null;
    onClose: () => void;
}

const recipientSchema = z.object({
    phoneNumber: z.string().min(1, 'Phone number is required'),
    languageCode: z.string().min(1, 'Language code is required'),
    gender: z.string().optional(),
    optInStatus: z.coerce.boolean(),
    isActive: z.coerce.boolean(),
});

type RecipientFormData = z.infer<typeof recipientSchema>;

const RecipientForm: React.FC<RecipientFormProps> = ({ recipientToEdit, onClose }) => {
    const isEditMode = Boolean(recipientToEdit);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<RecipientFormData>({
        resolver: zodResolver(recipientSchema),
        defaultValues: {
            phoneNumber: '',
            languageCode: 'so', // Defaulting to Somali as seen in previous snippet or just generic 'en'
            gender: '',
            optInStatus: true,
            isActive: true,
        },
    });

    const [createRecipient] = useCreateRecipientMutation();
    const [updateRecipient] = useUpdateRecipientMutation();

    useEffect(() => {
        if (recipientToEdit) {
            reset({
                phoneNumber: recipientToEdit.phoneNumber,
                languageCode: recipientToEdit.languageCode,
                gender: recipientToEdit.gender || '',
                optInStatus: recipientToEdit.optInStatus,
                isActive: recipientToEdit.isActive,
            });
        }
    }, [recipientToEdit, reset]);

    const onSubmit = async (data: RecipientFormData) => {
        try {
            if (isEditMode && recipientToEdit) {
                await updateRecipient({ id: recipientToEdit._id, data }).unwrap();
                toast.success('Recipient updated successfully');
            } else {
                await createRecipient(data).unwrap();
                toast.success('Recipient created successfully');
            }
            onClose();
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || 'An error occurred');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <FormInput
                            id="phoneNumber"
                            type="text"
                            label="Phone Number"
                            error={errors.phoneNumber?.message}
                            placeholder="Enter phone number"
                            disabled={isSubmitting}
                            {...field}
                        />
                    )}
                />

                <Controller
                    name="languageCode"
                    control={control}
                    render={({ field }) => (
                        <FormInput
                            id="languageCode"
                            type="text"
                            label="Language Code"
                            error={errors.languageCode?.message}
                            placeholder="e.g. en, so"
                            disabled={isSubmitting}
                            {...field}
                        />
                    )}
                />

                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                        <FormSelect
                            id="gender"
                            label="Gender"
                            error={errors.gender?.message}
                            disabled={isSubmitting}
                            options={[
                                { value: '', label: 'Select Gender' },
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                            ]}
                            {...field}
                            value={field.value || ''}
                            onBlur={field.onBlur}
                        />
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    name="optInStatus"
                    control={control}
                    render={({ field }) => (
                        <FormSelect
                            id="optInStatus"
                            label="Opt-In Status"
                            error={errors.optInStatus?.message}
                            disabled={isSubmitting}
                            options={[
                                { value: 'true', label: 'Opted In' },
                                { value: 'false', label: 'Opted Out' },
                            ]}
                            {...field}
                            value={String(field.value)}
                            onChange={(value: string) => field.onChange(value === 'true')}
                        />
                    )}
                />

                <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                        <FormSelect
                            id="isActive"
                            label="Active Status"
                            error={errors.isActive?.message}
                            disabled={isSubmitting}
                            options={[
                                { value: 'true', label: 'Active' },
                                { value: 'false', label: 'Inactive' },
                            ]}
                            {...field}
                            value={String(field.value)}
                            onChange={(value: string) => field.onChange(value === 'true')}
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

export default RecipientForm;