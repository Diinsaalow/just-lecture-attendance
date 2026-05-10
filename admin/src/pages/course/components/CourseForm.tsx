import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateCourseMutation, useUpdateCourseMutation } from '../../../store/api/courseApi';
import { useGetAllDepartmentsQuery } from '../../../store/api/departmentApi';
import type { ICourse } from '../../../types/course';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    departmentId: z.string().optional(),
    type: z.enum(['CORE', 'GENERAL'], { required_error: 'Type is required' }),
    credit: z.coerce.number().min(0, 'Must be ≥ 0'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;



interface Props {
    itemToEdit?: ICourse | null;
    onClose: () => void;
}

const CourseForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: depRes } = useGetAllDepartmentsQuery({ query: {}, options: { limit: 500, page: 1 } });

    const courseTypeOpts = [
        { value: 'CORE', label: 'Core' },
        { value: 'GENERAL', label: 'General' },
    ];

    const depOpts = useMemo(() => {
        const opts = (depRes?.docs ?? []).map((d) => ({ value: d._id, label: d.name }));
        return [{ value: '', label: 'General (No Department)' }, ...opts];
    }, [depRes]);



    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            departmentId: '',
            type: 'CORE',
            credit: 0,
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateCourseMutation();
    const [updateItem] = useUpdateCourseMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                departmentId: !itemToEdit.departmentId
                    ? ''
                    : typeof itemToEdit.departmentId === 'string'
                        ? itemToEdit.departmentId
                        : itemToEdit.departmentId._id,
                type: itemToEdit.type,
                credit: itemToEdit.credit,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        const payload = {
            name: data.name,
            departmentId: data.departmentId || null,
            type: data.type,
            credit: data.credit,
            status: data.status,
        };
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Course updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Course created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller name="name" control={control} render={({ field }) => <FormInput id="c-name" label="Name" error={errors.name?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="departmentId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="c-dept"
                        label="Department"
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={depOpts}
                        error={errors.departmentId?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="type"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="c-type"
                        label="Type"
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={courseTypeOpts}
                        error={errors.type?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="credit"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="c-credit"
                        type="number"
                        label="Credit hours"
                        error={errors.credit?.message}
                        disabled={isSubmitting}
                        value={String(field.value ?? '')}
                        onChange={(v) => field.onChange(v === '' ? 0 : Number(v))}
                        onBlur={field.onBlur}
                    />
                )}
            />

            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="c-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default CourseForm;
