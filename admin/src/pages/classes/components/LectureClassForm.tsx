import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateLectureClassMutation, useUpdateLectureClassMutation } from '../../../store/api/lectureClassApi';
import { useGetAllDepartmentsQuery } from '../../../store/api/departmentApi';
import { useGetAllCampusesQuery } from '../../../store/api/campusApi';
import { useGetAllAcademicYearsQuery } from '../../../store/api/academicYearApi';
import type { ILectureClass } from '../../../types/lectureClass';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    departmentId: z.string().min(1, 'Department is required'),
    mode: z.string().min(1, 'Mode is required'),
    shift: z.string().min(1, 'Shift is required'),
    size: z.coerce.number().min(1, 'Min 1'),
    campusId: z.string().min(1, 'Campus is required'),
    batchId: z.string().min(1, 'Batch is required'),
    academicYearId: z.string().min(1, 'Academic year is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: ILectureClass | null;
    onClose: () => void;
}

const LectureClassForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: dRes } = useGetAllDepartmentsQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: cRes } = useGetAllCampusesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: yRes } = useGetAllAcademicYearsQuery({ query: {}, options: { limit: 200, page: 1 } });

    const depOpts = useMemo(() => (dRes?.docs ?? []).map((d) => ({ value: d._id, label: d.name })), [dRes]);
    const campusOpts = useMemo(() => (cRes?.docs ?? []).map((c) => ({ value: c._id, label: c.campusName })), [cRes]);
    const ayOpts = useMemo(() => (yRes?.docs ?? []).map((y) => ({ value: y._id, label: y.name })), [yRes]);

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
            mode: '',
            shift: '',
            size: 1,
            campusId: '',
            batchId: '',
            academicYearId: '',
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateLectureClassMutation();
    const [updateItem] = useUpdateLectureClassMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                departmentId: typeof itemToEdit.departmentId === 'string' ? itemToEdit.departmentId : itemToEdit.departmentId._id,
                mode: itemToEdit.mode,
                shift: itemToEdit.shift,
                size: itemToEdit.size,
                campusId: typeof itemToEdit.campusId === 'string' ? itemToEdit.campusId : itemToEdit.campusId._id,
                batchId: itemToEdit.batchId,
                academicYearId: typeof itemToEdit.academicYearId === 'string' ? itemToEdit.academicYearId : itemToEdit.academicYearId._id,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data }).unwrap();
                toast.success('Class updated');
            } else {
                await createItem(data).unwrap();
                toast.success('Class created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller name="name" control={control} render={({ field }) => <FormInput id="lc-name" label="Name" error={errors.name?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="departmentId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="lc-dep" label="Department" value={value} onChange={onChange} onBlur={onBlur} options={depOpts} error={errors.departmentId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller name="mode" control={control} render={({ field }) => <FormInput id="lc-mode" label="Mode" error={errors.mode?.message} disabled={isSubmitting} {...field} />} />
            <Controller name="shift" control={control} render={({ field }) => <FormInput id="lc-shift" label="Shift" error={errors.shift?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="size"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="lc-size"
                        type="number"
                        label="Size"
                        error={errors.size?.message}
                        disabled={isSubmitting}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)}
                        onChange={(v) => field.onChange(v === '' ? 1 : Number(v))}
                        onBlur={field.onBlur}
                    />
                )}
            />
            <Controller
                name="campusId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="lc-camp" label="Campus" value={value} onChange={onChange} onBlur={onBlur} options={campusOpts} error={errors.campusId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller name="batchId" control={control} render={({ field }) => <FormInput id="lc-batch" label="Batch ID" error={errors.batchId?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="academicYearId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="lc-ay" label="Academic year" value={value} onChange={onChange} onBlur={onBlur} options={ayOpts} error={errors.academicYearId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="lc-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default LectureClassForm;
