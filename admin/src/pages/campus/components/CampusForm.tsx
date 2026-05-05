import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateCampusMutation, useUpdateCampusMutation } from '../../../store/api/campusApi';
import type { ICampus } from '../../../types/campus';

const schema = z.object({
    campusName: z.string().min(1, 'Campus name is required'),
    telephone: z.string().min(1, 'Telephone is required'),
    location: z.string().min(1, 'Location is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: ICampus | null;
    onClose: () => void;
}

const CampusForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { campusName: '', telephone: '', location: '', status: 'ACTIVE' },
    });

    const [createItem] = useCreateCampusMutation();
    const [updateItem] = useUpdateCampusMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                campusName: itemToEdit.campusName,
                telephone: itemToEdit.telephone,
                location: itemToEdit.location,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload = { ...data };
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Campus updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Campus created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            const msg = (error as { data?: { message?: string } })?.data?.message;
            toast.error(msg || 'Request failed');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="campusName"
                control={control}
                render={({ field }) => (
                    <FormInput id="campus-name" type="text" label="Campus name" error={errors.campusName?.message} disabled={isSubmitting} {...field} />
                )}
            />
            <Controller
                name="telephone"
                control={control}
                render={({ field }) => <FormInput id="campus-tel" type="text" label="Telephone" error={errors.telephone?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="location"
                control={control}
                render={({ field }) => <FormInput id="campus-loc" type="text" label="Location" error={errors.location?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="campus-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText={isEdit ? 'Updating...' : 'Saving...'}
                    displayText={isEdit ? 'Update' : 'Save'}
                    className="ltr:ml-4 rtl:mr-4"
                />
            </div>
        </form>
    );
};

export default CampusForm;
