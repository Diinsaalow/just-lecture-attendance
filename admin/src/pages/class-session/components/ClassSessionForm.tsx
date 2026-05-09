import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormDatePicker from '../../../components/form/FormDatePicker';
import FormSelect from '../../../components/form/FormSelect';
import { useCreateClassSessionMutation, useUpdateClassSessionMutation } from '../../../store/api/classSessionApi';
import { useGetAllPeriodsQuery } from '../../../store/api/periodApi';
import type { IClassSession, ClassSessionStatus } from '../../../types/classSession';
import type { IPeriod } from '../../../types/period';
import { formatJamhuriyaUsername } from '../../../utils/jamhuriyaUsername';

const STATUS_OPTIONS: { value: ClassSessionStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'NO_SHOW', label: 'No show' },
];

const schema = z.object({
    periodId: z.string().min(1, 'Period is required'),
    scheduledDate: z.string().min(1, 'Date is required'),
    status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IClassSession | null;
    onClose: () => void;
}

function refName(ref: unknown, key = 'name'): string {
    if (typeof ref === 'object' && ref !== null && key in ref) {
        return String((ref as Record<string, unknown>)[key] ?? '');
    }
    return '';
}

function refId(ref: unknown): string {
    if (!ref) return '';
    if (typeof ref === 'string') return ref;
    if (typeof ref === 'object' && '_id' in ref) return String((ref as { _id?: string })._id ?? '');
    return '';
}

function lecturerLabel(ref: IPeriod['lecturerId']): string {
    if (typeof ref === 'string') return ref;
    const uname = ref.username ? formatJamhuriyaUsername(ref.username) : '';
    return uname || ref._id;
}

function periodLabel(period: IPeriod): string {
    const cls = refName(period.classId);
    const course = refName(period.courseId);
    const semester = refName(period.semesterId);
    return [cls, course, lecturerLabel(period.lecturerId), semester, `${period.day} ${period.from}-${period.to}`, period.type]
        .filter(Boolean)
        .join(' | ');
}

const ClassSessionForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: periodRes, isLoading: periodsLoading } = useGetAllPeriodsQuery({ query: {}, options: { limit: 500, page: 1 } });
    const [createItem] = useCreateClassSessionMutation();
    const [updateItem] = useUpdateClassSessionMutation();

    const periodOptions = useMemo(
        () => (periodRes?.docs ?? []).map((period) => ({ value: period._id, label: periodLabel(period) })),
        [periodRes],
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            periodId: '',
            scheduledDate: '',
            status: 'SCHEDULED',
        },
    });

    useEffect(() => {
        if (itemToEdit) {
            reset({
                periodId: refId(itemToEdit.periodId),
                scheduledDate: itemToEdit.scheduledDate ? moment(itemToEdit.scheduledDate).format('YYYY-MM-DD') : '',
                status: itemToEdit.status,
            });
        } else {
            reset({
                periodId: '',
                scheduledDate: '',
                status: 'SCHEDULED',
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data }).unwrap();
                toast.success('Class session updated');
            } else {
                await createItem(data).unwrap();
                toast.success('Class session created');
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
                name="periodId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="cs-period"
                        label="Period"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={periodOptions}
                        error={errors.periodId?.message}
                        disabled={isSubmitting || periodsLoading}
                    />
                )}
            />
            <Controller
                name="scheduledDate"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormDatePicker
                        id="cs-date"
                        label="Date"
                        value={value}
                        onChange={(dates) => onChange(dates[0] ? moment(dates[0]).format('YYYY-MM-DD') : '')}
                        onBlur={onBlur}
                        error={errors.scheduledDate?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="cs-status-modal"
                        label="Status"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={STATUS_OPTIONS}
                        error={errors.status?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default ClassSessionForm;
