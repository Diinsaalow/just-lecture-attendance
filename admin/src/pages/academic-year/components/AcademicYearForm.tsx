import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateAcademicYearMutation, useUpdateAcademicYearMutation } from '../../../store/api/academicYearApi';
import type { IAcademicYear } from '../../../types/academicYear';

const schema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        startDate: z.string().min(1, 'Start date is required'),
        endDate: z.string().min(1, 'End date is required'),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
        message: 'End date must be after start date',
        path: ['endDate'],
    });

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IAcademicYear | null;
    onClose: () => void;
}

const AcademicYearForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            startDate: '',
            endDate: '',
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateAcademicYearMutation();
    const [updateItem] = useUpdateAcademicYearMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                startDate: itemToEdit.startDate ? itemToEdit.startDate.slice(0, 10) : '',
                endDate: itemToEdit.endDate ? itemToEdit.endDate.slice(0, 10) : '',
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        const payload = {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            ...(data.status && { status: data.status }),
        };
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Academic year updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Academic year created');
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
                name="name"
                control={control}
                render={({ field }) => (
                    <FormInput id="ay-name" type="text" label="Name" error={errors.name?.message} placeholder="e.g. 2025/2026" disabled={isSubmitting} {...field} />
                )}
            />
            <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                    <FormInput id="ay-start" type="date" label="Start date" error={errors.startDate?.message} disabled={isSubmitting} {...field} />
                )}
            />
            <Controller
                name="endDate"
                control={control}
                render={({ field }) => <FormInput id="ay-end" type="date" label="End date" error={errors.endDate?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="ay-status"
                        label="Status"
                        value={value || 'ACTIVE'}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={ENTITY_STATUS_OPTIONS}
                        disabled={isSubmitting}
                        error={errors.status?.message}
                    />
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

export default AcademicYearForm;
