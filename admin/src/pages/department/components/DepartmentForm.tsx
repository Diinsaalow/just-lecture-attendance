import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '../../../store/api/departmentApi';
import { useGetAllFacultiesQuery } from '../../../store/api/facultyApi';
import type { IDepartment } from '../../../types/department';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    graduationName: z.string().min(1, 'Required'),
    facultyId: z.string().min(1, 'Faculty is required'),
    duration: z.string().min(1, 'Required'),
    abbreviation: z.string().min(1, 'Required'),
    degree: z.string().min(1, 'Required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IDepartment | null;
    onClose: () => void;
}

const DepartmentForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: facRes } = useGetAllFacultiesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const facultyOptions = useMemo(() => (facRes?.docs ?? []).map((f) => ({ value: f._id, label: f.name })), [facRes]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            graduationName: '',
            facultyId: '',
            duration: '',
            abbreviation: '',
            degree: '',
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateDepartmentMutation();
    const [updateItem] = useUpdateDepartmentMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                graduationName: itemToEdit.graduationName,
                facultyId: typeof itemToEdit.facultyId === 'string' ? itemToEdit.facultyId : itemToEdit.facultyId._id,
                duration: itemToEdit.duration,
                abbreviation: itemToEdit.abbreviation,
                degree: itemToEdit.degree,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data }).unwrap();
                toast.success('Department updated');
            } else {
                await createItem(data).unwrap();
                toast.success('Department created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller name="name" control={control} render={({ field }) => <FormInput id="d-name" label="Name" error={errors.name?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="graduationName"
                control={control}
                render={({ field }) => <FormInput id="d-grad" label="Graduation name" error={errors.graduationName?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="facultyId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="d-fac" label="Faculty" value={value} onChange={onChange} onBlur={onBlur} options={facultyOptions} error={errors.facultyId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller name="duration" control={control} render={({ field }) => <FormInput id="d-dur" label="Duration" error={errors.duration?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="abbreviation"
                control={control}
                render={({ field }) => <FormInput id="d-abbr" label="Abbreviation" error={errors.abbreviation?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller name="degree" control={control} render={({ field }) => <FormInput id="d-deg" label="Degree" error={errors.degree?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="d-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default DepartmentForm;
