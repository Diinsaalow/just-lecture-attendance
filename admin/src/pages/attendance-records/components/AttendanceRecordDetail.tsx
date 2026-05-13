import moment from 'moment';
import type { ReactNode } from 'react';
import { useGetAttendanceRecordByIdQuery } from '../../../store/api/attendanceRecordApi';
import type { IAttendanceRecordRow } from '../../../types/attendanceRecord';

function refName(ref: unknown): string {
    if (!ref || typeof ref !== 'object') return '—';
    const o = ref as { name?: string };
    return o.name ?? '—';
}

function instructorBlock(ins: IAttendanceRecordRow['instructorUserId']): string {
    if (!ins || typeof ins === 'string') return '—';
    const full = `${ins.firstName ?? ''} ${ins.lastName ?? ''}`.trim();
    return full || ins.username || ins.email || '—';
}

function hallBlock(hall: IAttendanceRecordRow['hallId']): string {
    if (!hall || typeof hall === 'string') return '—';
    const h = hall as { name?: string; code?: string };
    const code = h.code ? ` (${h.code})` : '';
    return `${h.name ?? ''}${code}`.trim() || '—';
}

function deviceLine(row: IAttendanceRecordRow): string {
    const ins = row.instructorUserId;
    if (!ins || typeof ins === 'string') return '—';
    const used = row.checkInDeviceId;
    if (!used) return '—';
    if (ins.registeredDeviceId && used === ins.registeredDeviceId) return `Verified · ${used}`;
    if (ins.pendingDeviceId && used === ins.pendingDeviceId) return `Pending device · ${used}`;
    return `Unregistered · ${used}`;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 dark:border-[#1b2e4b] text-sm">
            <div className="text-gray-500 dark:text-gray-400">{label}</div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white break-all">{value}</div>
        </div>
    );
}

export default function AttendanceRecordDetail({ recordId }: { recordId: string | null }) {
    const { data, isLoading, error, refetch } = useGetAttendanceRecordByIdQuery(recordId!, { skip: !recordId });

    if (!recordId) {
        return <p className="text-sm text-gray-500 p-4">Select a record to view details.</p>;
    }

    if (isLoading) {
        return <p className="text-sm p-4">Loading…</p>;
    }

    if (error || !data) {
        return (
            <div className="p-4">
                <p className="text-sm text-red-600 mb-2">Could not load this attendance record.</p>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => refetch()}>
                    Retry
                </button>
            </div>
        );
    }

    const row = data as IAttendanceRecordRow;
    const session = row.sessionId;

    return (
        <div className="p-4 max-h-[80vh] overflow-y-auto">
            <DetailRow label="Instructor" value={instructorBlock(row.instructorUserId)} />
            <DetailRow label="Faculty" value={refName(row.facultyId)} />
            <DetailRow label="Department" value={refName(row.departmentId)} />
            <DetailRow label="Class" value={refName(row.classId)} />
            <DetailRow label="Course" value={refName(row.courseId)} />
            <DetailRow label="Hall" value={hallBlock(row.hallId)} />
            <DetailRow label="Session date" value={row.scheduledDate ? moment(row.scheduledDate).format('YYYY-MM-DD') : '—'} />
            <DetailRow
                label="Scheduled window"
                value={
                    row.scheduledStart && row.scheduledEnd
                        ? `${moment(row.scheduledStart, 'HH:mm').format('hh:mm A')} – ${moment(row.scheduledEnd, 'HH:mm').format('hh:mm A')}`
                        : '—'
                }
            />
            <DetailRow
                label="Check-in"
                value={row.checkInAt ? `${moment(row.checkInAt).format('YYYY-MM-DD HH:mm')} (${row.checkInMethod ?? '—'})` : '—'}
            />
            <DetailRow
                label="Check-out"
                value={row.checkOutAt ? `${moment(row.checkOutAt).format('YYYY-MM-DD HH:mm')} (${row.checkOutMethod ?? '—'})` : '—'}
            />
            <DetailRow label="Status" value={row.status} />
            <DetailRow label="Flags" value={(row.statusFlags ?? []).join(', ') || '—'} />
            <DetailRow label="Device (check-in)" value={deviceLine(row)} />
            <DetailRow label="Duration (min)" value={row.actualDurationMinutes != null ? String(row.actualDurationMinutes) : '—'} />
            <DetailRow
                label="Class session"
                value={
                    session && typeof session === 'object' && 'scheduledDate' in session ? (
                        <span className="font-mono text-xs">
                            {String((session as { _id?: string })._id ?? '')}
                            {session.scheduledDate ? (
                                <span className="block text-gray-500">
                                    {moment(session.scheduledDate).format('YYYY-MM-DD')} · {(session as { status?: string }).status ?? ''}
                                </span>
                            ) : null}
                        </span>
                    ) : (
                        String(session ?? '—')
                    )
                }
            />
        </div>
    );
}
