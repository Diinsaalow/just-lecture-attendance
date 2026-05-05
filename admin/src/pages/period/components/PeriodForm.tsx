import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS, PERIOD_TYPE_OPTIONS } from '../../../constants/entityStatus';
import { useCreatePeriodMutation, useUpdatePeriodMutation } from '../../../store/api/periodApi';
import { useGetAllLectureClassesQuery } from '../../../store/api/lectureClassApi';
import { useGetAllCoursesQuery } from '../../../store/api/courseApi';
import { useGetAllSemestersQuery } from '../../../store/api/semesterApi';
import { useGetAllUsersQuery } from '../../../store/api/userApi';
import type { IPeriod } from '../../../types/period';

const schema = z.object({
    classId: z.string().min(1, 'Class is required'),
    courseId: z.string().min(1, 'Course is required'),
    lecturerId: z.string().min(1, 'Lecturer is required'),
    semesterId: z.string().min(1, 'Semester is required'),
    day: z.string().min(1, 'Day is required'),
    type: z.enum(['Lab', 'Theory']),
    from: z.string().min(1, 'From is required'),
    to: z.string().min(1, 'To is required'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IPeriod | null;
    onClose: () => void;
}

const PeriodForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: lcRes } = useGetAllLectureClassesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: coRes } = useGetAllCoursesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: seRes } = useGetAllSemestersQuery({ query: {}, options: { limit: 200, page: 1 } });
    const { data: usRes } = useGetAllUsersQuery({ query: {}, options: { limit: 500, page: 1 } });

    const classOpts = useMemo(() => (lcRes?.docs ?? []).map((c) => ({ value: c._id, label: c.name })), [lcRes]);
    const courseOpts = useMemo(() => (coRes?.docs ?? []).map((c) => ({ value: c._id, label: c.name })), [coRes]);
    const semOpts = useMemo(() => (seRes?.docs ?? []).map((s) => ({ value: s._id, label: s.name })), [seRes]);
    const userOpts = useMemo(
        () => (usRes?.docs ?? []).map((u) => ({ value: u._id, label: u.username || u.email || u._id })),
        [usRes],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            classId: '',
            courseId: '',
            lecturerId: '',
            semesterId: '',
            day: '',
            type: 'Theory',
            from: '',
            to: '',
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreatePeriodMutation();
    const [updateItem] = useUpdatePeriodMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                classId: typeof itemToEdit.classId === 'string' ? itemToEdit.classId : itemToEdit.classId._id,
                courseId: typeof itemToEdit.courseId === 'string' ? itemToEdit.courseId : itemToEdit.courseId._id,
                lecturerId: typeof itemToEdit.lecturerId === 'string' ? itemToEdit.lecturerId : itemToEdit.lecturerId._id,
                semesterId: typeof itemToEdit.semesterId === 'string' ? itemToEdit.semesterId : itemToEdit.semesterId._id,
                day: itemToEdit.day,
                type: itemToEdit.type,
                from: itemToEdit.from,
                to: itemToEdit.to,
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data }).unwrap();
                toast.success('Period updated');
            } else {
                await createItem(data).unwrap();
                toast.success('Period created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="classId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-class" label="Class" value={value} onChange={onChange} onBlur={onBlur} options={classOpts} error={errors.classId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="courseId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-course" label="Course" value={value} onChange={onChange} onBlur={onBlur} options={courseOpts} error={errors.courseId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="lecturerId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-lec" label="Lecturer" value={value} onChange={onChange} onBlur={onBlur} options={userOpts} error={errors.lecturerId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="semesterId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-sem" label="Semester" value={value} onChange={onChange} onBlur={onBlur} options={semOpts} error={errors.semesterId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller name="day" control={control} render={({ field }) => <FormInput id="p-day" label="Day" error={errors.day?.message} disabled={isSubmitting} {...field} placeholder="e.g. Monday" />} />
            <Controller
                name="type"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-type" label="Type" value={value} onChange={onChange} onBlur={onBlur} options={PERIOD_TYPE_OPTIONS} disabled={isSubmitting} error={errors.type?.message} />
                )}
            />
            <Controller name="from" control={control} render={({ field }) => <FormInput id="p-from" label="From" error={errors.from?.message} disabled={isSubmitting} {...field} placeholder="08:00" />} />
            <Controller name="to" control={control} render={({ field }) => <FormInput id="p-to" label="To" error={errors.to?.message} disabled={isSubmitting} {...field} placeholder="09:30" />} />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default PeriodForm;
