import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateSemesterMutation, useUpdateSemesterMutation } from '../../../store/api/semesterApi';
import { useGetAllAcademicYearsQuery } from '../../../store/api/academicYearApi';
import type { ISemester } from '../../../types/semester';

const schema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        startDate: z.string().min(1, 'Required'),
        endDate: z.string().min(1, 'Required'),
        academicYearId: z.string().min(1, 'Academic year is required'),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    })
    .refine((d) => new Date(d.endDate) > new Date(d.startDate), { message: 'End after start', path: ['endDate'] });

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: ISemester | null;
    onClose: () => void;
}

const SemesterForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: ayRes } = useGetAllAcademicYearsQuery({ query: {}, options: { limit: 200, page: 1 } });
    const ayOptions = useMemo(() => (ayRes?.docs ?? []).map((y) => ({ value: y._id, label: y.name })), [ayRes]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', startDate: '', endDate: '', academicYearId: '', status: 'ACTIVE' },
    });

    const [createItem] = useCreateSemesterMutation();
    const [updateItem] = useUpdateSemesterMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                startDate: itemToEdit.startDate ? itemToEdit.startDate.slice(0, 10) : '',
                endDate: itemToEdit.endDate ? itemToEdit.endDate.slice(0, 10) : '',
                academicYearId:
                    typeof itemToEdit.academicYearId === 'string' ? itemToEdit.academicYearId : itemToEdit.academicYearId._id,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload = { ...data };
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Semester updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Semester created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller name="name" control={control} render={({ field }) => <FormInput id="s-name" label="Name" error={errors.name?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="academicYearId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="s-ay" label="Academic year" value={value} onChange={onChange} onBlur={onBlur} options={ayOptions} error={errors.academicYearId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller name="startDate" control={control} render={({ field }) => <FormInput id="s-start" type="date" label="Start" error={errors.startDate?.message} disabled={isSubmitting} {...field} />} />
            <Controller name="endDate" control={control} render={({ field }) => <FormInput id="s-end" type="date" label="End" error={errors.endDate?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="s-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default SemesterForm;
