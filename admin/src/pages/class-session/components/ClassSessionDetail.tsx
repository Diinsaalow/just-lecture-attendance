import React from 'react';
import moment from 'moment';
import { useGetClassSessionByIdQuery, useUpdateClassSessionMutation } from '../../../store/api/classSessionApi';
import { usePermission } from '../../../hooks/usePermission';
import FormSelect from '../../../components/form/FormSelect';
import ActionButton from '../../../components/ActionButton';
import { toast } from 'sonner';
import type { ClassSessionStatus, IClassSession } from '../../../types/classSession';

const STATUS_OPTIONS: { value: ClassSessionStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'NO_SHOW', label: 'No show' },
];

function cell(ref: unknown, key: string): string {
    if (typeof ref === 'object' && ref !== null && key in ref) return String((ref as Record<string, unknown>)[key]);
    return '-';
}

function hallLabel(hall: IClassSession['hallId']): string {
    if (!hall) return '—';
    if (typeof hall === 'string') return hall;
    const name = hall.name ?? '';
    const code = hall.code ? ` (${hall.code})` : '';
    return `${name}${code}`.trim() || '—';
}

interface Props {
    classSessionId: string | null;
}

const ClassSessionDetail: React.FC<Props> = ({ classSessionId }) => {
    const id = classSessionId ? String(classSessionId) : '';
    const { data: row, isLoading } = useGetClassSessionByIdQuery(id, { skip: !id });
    const [updateSession, { isLoading: saving }] = useUpdateClassSessionMutation();
    const { can } = usePermission();
    const canUpdate = can('update', 'ClassSession');

    const [status, setStatus] = React.useState<ClassSessionStatus | ''>('');

    React.useEffect(() => {
        if (row?.status) setStatus(row.status);
    }, [row?.status]);

    const handleSaveStatus = async () => {
        if (!id || !status || !row) return;
        try {
            await updateSession({ id, data: { status } }).unwrap();
            toast.success('Session updated');
        } catch (e: unknown) {
            toast.error((e as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    if (isLoading) return <p className="text-gray-500">Loading...</p>;
    if (!row) return <p className="text-gray-500">None selected</p>;

    return (
        <div className="space-y-3 text-sm">
            <p>Date: {row.scheduledDate ? moment(row.scheduledDate).format('YYYY-MM-DD') : '—'}</p>
            <p>Class: {cell(row.classId, 'name')}</p>
            <p>Course: {cell(row.courseId, 'name')}</p>
            <p>Lecturer: {cell(row.lecturerId, 'username')}</p>
            <p>Semester: {cell(row.semesterId, 'name')}</p>
            <p>Hall: {hallLabel(row.hallId)}</p>
            <p>
                {row.dayLabel} · {row.type} · {moment(row.fromTime, 'HH:mm').format('hh:mm A')}–{moment(row.toTime, 'HH:mm').format('hh:mm A')}
            </p>
            {canUpdate ? (
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <FormSelect
                        id="cs-status"
                        label="Status"
                        value={status || row.status}
                        onChange={(v) => setStatus(v as ClassSessionStatus)}
                        onBlur={() => {}}
                        options={STATUS_OPTIONS}
                        disabled={saving}
                    />
                    <ActionButton type="button" variant="primary" displayText="Save status" isLoading={saving} onClick={handleSaveStatus} />
                </div>
            ) : (
                <p>Status: {row.status}</p>
            )}
        </div>
    );
};

export default ClassSessionDetail;
