import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateFacultyMutation, useUpdateFacultyMutation } from '../../../store/api/facultyApi';
import { useGetAllCampusesQuery } from '../../../store/api/campusApi';
import type { IFaculty } from '../../../types/faculty';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    code: z.string().optional(),
    campusId: z.string().min(1, 'Campus is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IFaculty | null;
    onClose: () => void;
}

const FacultyForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: campusRes } = useGetAllCampusesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const campusOptions = useMemo(
        () => (campusRes?.docs ?? []).map((c) => ({ value: c._id, label: c.campusName })),
        [campusRes],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', description: '', code: '', campusId: '', status: 'ACTIVE' },
    });

    const [createItem] = useCreateFacultyMutation();
    const [updateItem] = useUpdateFacultyMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                description: itemToEdit.description || '',
                code: itemToEdit.code || '',
                campusId: typeof itemToEdit.campusId === 'string' ? itemToEdit.campusId : itemToEdit.campusId._id,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                name: data.name,
                campusId: data.campusId,
                ...(data.description && { description: data.description }),
                ...(data.code && { code: data.code }),
                ...(data.status && { status: data.status }),
            };
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Faculty updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Faculty created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Request failed');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field }) => <FormInput id="f-name" type="text" label="Name" error={errors.name?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="campusId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="f-campus" label="Campus" value={value} onChange={onChange} onBlur={onBlur} options={campusOptions} error={errors.campusId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="code"
                control={control}
                render={({ field }) => (
                    <FormInput id="f-code" type="text" label="Code" error={errors.code?.message} disabled={isSubmitting} {...field} value={field.value ?? ''} />
                )}
            />
            <Controller
                name="description"
                control={control}
                render={({ field }) => (
                    <FormInput id="f-desc" type="text" label="Description" error={errors.description?.message} disabled={isSubmitting} {...field} value={field.value ?? ''} />
                )}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="f-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default FacultyForm;
