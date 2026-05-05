import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormMultiSelect from '../../../components/form/FormMultiSelect';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateCourseMutation, useUpdateCourseMutation } from '../../../store/api/courseApi';
import { useGetAllDepartmentsQuery } from '../../../store/api/departmentApi';
import { useGetAllUsersQuery } from '../../../store/api/userApi';
import type { ICourse } from '../../../types/course';
import type { IUser } from '../../../types/auth';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    departmentId: z.string().min(1, 'Department is required'),
    type: z.string().min(1, 'Type is required'),
    credit: z.coerce.number().min(0, 'Must be ≥ 0'),
    lecturers: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

function userRoleName(u: IUser): string {
    const r = u.role;
    if (typeof r === 'string') return r.toLowerCase();
    return ((r as { name?: string })?.name ?? '').toLowerCase();
}

function lecturerIdsFromCourse(c: ICourse): string[] {
    if (!c.lecturers?.length) return [];
    return c.lecturers.map((x) => (typeof x === 'string' ? x : String((x as IUser)._id)));
}

interface Props {
    itemToEdit?: ICourse | null;
    onClose: () => void;
}

const CourseForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: depRes } = useGetAllDepartmentsQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: usersRes } = useGetAllUsersQuery({ query: {}, options: { limit: 500, page: 1 } });

    const depOpts = useMemo(() => (depRes?.docs ?? []).map((d) => ({ value: d._id, label: d.name })), [depRes]);

    const labelUser = (u: IUser) =>
        [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.username || u.email || u._id;

    const instructorOpts = useMemo(() => {
        const docs = usersRes?.docs ?? [];
        const allOpts = docs.map((u) => ({ value: u._id, label: labelUser(u) }));
        const instructorDocs = docs.filter((u) => userRoleName(u) === 'instructor');
        let opts = instructorDocs.length > 0 ? allOpts.filter((o) => instructorDocs.some((u) => u._id === o.value)) : allOpts;

        if (itemToEdit?.lecturers?.length) {
            const selected = lecturerIdsFromCourse(itemToEdit);
            const have = new Set(opts.map((o) => o.value));
            for (const id of selected) {
                if (!have.has(id)) {
                    const u = docs.find((d) => d._id === id);
                    opts = [...opts, { value: id, label: u ? labelUser(u) : id }];
                    have.add(id);
                }
            }
        }
        return opts;
    }, [usersRes, itemToEdit]);

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
            type: '',
            credit: 0,
            lecturers: [],
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateCourseMutation();
    const [updateItem] = useUpdateCourseMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                departmentId:
                    typeof itemToEdit.departmentId === 'string' ? itemToEdit.departmentId : itemToEdit.departmentId._id,
                type: itemToEdit.type,
                credit: itemToEdit.credit,
                lecturers: lecturerIdsFromCourse(itemToEdit),
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        const payload = {
            name: data.name,
            departmentId: data.departmentId,
            type: data.type,
            credit: data.credit,
            lecturers: data.lecturers ?? [],
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
                        value={value}
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
                render={({ field }) => (
                    <FormInput id="c-type" label="Type" error={errors.type?.message} disabled={isSubmitting} {...field} placeholder="e.g. Core, Elective" />
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
                name="lecturers"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <FormMultiSelect
                        id="c-instructors"
                        label="Instructors"
                        options={instructorOpts}
                        value={value ?? []}
                        onChange={onChange}
                        disabled={isSubmitting}
                        placeholder="Select instructors..."
                        searchable
                        searchPlaceholder="Search by name or username..."
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
