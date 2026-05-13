import moment from 'moment';
import { useMemo, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import FormSelect from '../../components/form/FormSelect';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useGetAllAttendanceRecordsQuery } from '../../store/api/attendanceRecordApi';
import { useGetAllCoursesQuery } from '../../store/api/courseApi';
import { useGetAllDepartmentsQuery } from '../../store/api/departmentApi';
import { useGetAllFacultiesQuery } from '../../store/api/facultyApi';
import { useGetAllLectureClassesQuery } from '../../store/api/lectureClassApi';
import { useGetAllLecturersQuery } from '../../store/api/lecturerApi';
import type { IAttendanceRecordRow } from '../../types/attendanceRecord';
import type { ColumnConfig } from '../../types/columns';
import AttendanceRecordDetail from './components/AttendanceRecordDetail';

function refName(ref: unknown): string {
    if (!ref || typeof ref !== 'object') return '-';
    const o = ref as { name?: string };
    return o.name ?? '-';
}

function instructorName(ins: IAttendanceRecordRow['instructorUserId']): string {
    if (!ins || typeof ins === 'string') return '-';
    const full = `${ins.firstName ?? ''} ${ins.lastName ?? ''}`.trim();
    return full || ins.username || ins.email || '-';
}

function hallLabel(hall: IAttendanceRecordRow['hallId']): string {
    if (!hall || typeof hall === 'string') return '-';
    const h = hall as { name?: string; code?: string };
    const code = h.code ? ` (${h.code})` : '';
    return `${h.name ?? ''}${code}`.trim() || '-';
}

function deviceStatus(row: IAttendanceRecordRow): string {
    const ins = row.instructorUserId;
    if (!ins || typeof ins === 'string') return '—';
    const used = row.checkInDeviceId;
    if (!used) return '—';
    if (ins.registeredDeviceId && used === ins.registeredDeviceId) return 'Verified';
    if (ins.pendingDeviceId && used === ins.pendingDeviceId) return 'Pending device';
    return 'Unregistered';
}

function formatTimeHm(iso: string | null | undefined): string {
    if (!iso) return '-';
    return moment(iso).format('HH:mm');
}

function resolveRefId(ref: unknown): string {
    if (ref == null) return '';
    if (typeof ref === 'object' && ref !== null && '_id' in ref) {
        return String((ref as { _id: string })._id);
    }
    return String(ref);
}

const AttendanceRecordsPage = () => {
    const { showSidebar, openSidebar, closeSidebar, selectedId } = useSidebarDetail();

    const [facultyId, setFacultyId] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [classId, setClassId] = useState('');
    const [courseId, setCourseId] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [status, setStatus] = useState('');
    const [checkInMethod, setCheckInMethod] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { data: facRes } = useGetAllFacultiesQuery({ query: {}, options: { limit: 200, page: 1 } });
    const { data: depRes } = useGetAllDepartmentsQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: classRes } = useGetAllLectureClassesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: courseRes } = useGetAllCoursesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: lecRes } = useGetAllLecturersQuery({ query: {}, options: { limit: 500, page: 1 } });

    const facultyOpts = useMemo(() => {
        const rows = facRes?.docs ?? [];
        return [{ value: '', label: 'All faculties' }, ...rows.map((f) => ({ value: f._id, label: f.name }))];
    }, [facRes]);

    const departmentOpts = useMemo(() => {
        const rows = depRes?.docs ?? [];
        const filtered = facultyId ? rows.filter((d) => resolveRefId(d.facultyId) === facultyId) : rows;
        return [{ value: '', label: 'All departments' }, ...filtered.map((d) => ({ value: d._id, label: d.name }))];
    }, [depRes, facultyId]);

    const classOpts = useMemo(() => {
        const rows = classRes?.docs ?? [];
        const filtered = departmentId ? rows.filter((c) => resolveRefId(c.departmentId) === departmentId) : rows;
        return [{ value: '', label: 'All classes' }, ...filtered.map((c) => ({ value: c._id, label: c.name }))];
    }, [classRes, departmentId]);

    const courseOpts = useMemo(() => {
        const rows = courseRes?.docs ?? [];
        const filtered = departmentId
            ? rows.filter((c) => {
                  const did = resolveRefId(c.departmentId);
                  return did !== '' && did === departmentId;
              })
            : rows;
        return [{ value: '', label: 'All courses' }, ...filtered.map((c) => ({ value: c._id, label: c.name }))];
    }, [courseRes, departmentId]);

    const lecturerOpts = useMemo(() => {
        const rows = lecRes?.docs ?? [];
        return [
            { value: '', label: 'All instructors' },
            ...rows.map((u) => ({
                value: u._id,
                label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || u.email || u._id,
            })),
        ];
    }, [lecRes]);

    const statusOpts = useMemo(
        () => [
            { value: '', label: 'All statuses' },
            { value: 'CHECKED_IN', label: 'Checked in' },
            { value: 'PRESENT', label: 'Present' },
            { value: 'LATE', label: 'Late' },
            { value: 'EARLY_CHECKOUT', label: 'Early checkout' },
            { value: 'MISSED_CHECKOUT', label: 'Missed checkout' },
            { value: 'ABSENT', label: 'Absent' },
            { value: 'EXCUSED', label: 'Excused' },
            { value: 'INVALID_ATTEMPT', label: 'Invalid attempt' },
            { value: 'REJECTED', label: 'Rejected' },
        ],
        [],
    );

    const methodOpts = useMemo(
        () => [
            { value: '', label: 'All methods' },
            { value: 'BIOMETRIC', label: 'Biometric' },
            { value: 'QR_CODE', label: 'QR code' },
        ],
        [],
    );

    const tableQuery = useMemo(() => {
        const q: Record<string, string> = {};
        if (facultyId) q.facultyId = facultyId;
        if (departmentId) q.departmentId = departmentId;
        if (classId) q.classId = classId;
        if (courseId) q.courseId = courseId;
        if (instructorId) q.instructorId = instructorId;
        if (status) q.status = status;
        if (checkInMethod) q.checkInMethod = checkInMethod;
        if (dateFrom) q.startDate = dateFrom;
        if (dateTo) q.endDate = dateTo;
        return q;
    }, [facultyId, departmentId, classId, courseId, instructorId, status, checkInMethod, dateFrom, dateTo]);

    const clearFilters = () => {
        setFacultyId('');
        setDepartmentId('');
        setClassId('');
        setCourseId('');
        setInstructorId('');
        setStatus('');
        setCheckInMethod('');
        setDateFrom('');
        setDateTo('');
    };

    const noopBlur = () => {};

    const columns: ColumnConfig<IAttendanceRecordRow>[] = [
        {
            accessor: 'instructorUserId',
            title: 'Instructor',
            type: 'text',
            sortable: false,
            render: (row) => <span>{instructorName(row.instructorUserId)}</span>,
        },
        {
            accessor: 'facultyId',
            title: 'Faculty',
            type: 'text',
            sortable: false,
            render: (row) => <span>{refName(row.facultyId)}</span>,
        },
        {
            accessor: 'departmentId',
            title: 'Department',
            type: 'text',
            sortable: false,
            render: (row) => <span>{refName(row.departmentId)}</span>,
        },
        {
            accessor: 'classId',
            title: 'Class',
            type: 'text',
            sortable: false,
            render: (row) => <span>{refName(row.classId)}</span>,
        },
        {
            accessor: 'courseId',
            title: 'Course',
            type: 'text',
            sortable: false,
            render: (row) => <span>{refName(row.courseId)}</span>,
        },
        {
            accessor: 'hallId',
            title: 'Hall',
            type: 'text',
            sortable: false,
            render: (row) => <span>{hallLabel(row.hallId)}</span>,
        },
        {
            accessor: 'scheduledDate',
            title: 'Session date',
            type: 'text',
            sortable: true,
            render: (row) => <span>{row.scheduledDate ? moment(row.scheduledDate).format('YYYY-MM-DD') : '-'}</span>,
        },
        {
            accessor: 'scheduledStart',
            title: 'Sched. start',
            type: 'text',
            sortable: true,
            render: (row) => (
                <span>{row.scheduledStart ? moment(row.scheduledStart, 'HH:mm').format('hh:mm A') : '-'}</span>
            ),
        },
        {
            accessor: 'scheduledEnd',
            title: 'Sched. end',
            type: 'text',
            sortable: true,
            render: (row) => (
                <span>{row.scheduledEnd ? moment(row.scheduledEnd, 'HH:mm').format('hh:mm A') : '-'}</span>
            ),
        },
        {
            accessor: 'checkInAt',
            title: 'Check-in',
            type: 'text',
            sortable: true,
            render: (row) => <span>{formatTimeHm(row.checkInAt)}</span>,
        },
        {
            accessor: 'checkOutAt',
            title: 'Check-out',
            type: 'text',
            sortable: false,
            render: (row) => <span>{formatTimeHm(row.checkOutAt)}</span>,
        },
        { accessor: 'status', title: 'Status', type: 'text', sortable: true },
        {
            accessor: 'checkInMethod',
            title: 'Check-in method',
            type: 'text',
            sortable: false,
            render: (row) => <span>{row.checkInMethod?.replace(/_/g, ' ') ?? '-'}</span>,
        },
        {
            accessor: 'deviceStatus',
            title: 'Device status',
            type: 'text',
            sortable: false,
            render: (row) => <span>{deviceStatus(row)}</span>,
        },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            sortable: false,
            textAlignment: 'center',
            actions: [{ type: 'view', onClick: (row) => openSidebar(row._id) }],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Attendance records' }]} />
            <DataTableWithSidebar<IAttendanceRecordRow>
                title="Attendance Records"
                columns={columns}
                fetchData={useGetAllAttendanceRecordsQuery}
                searchFields={['status', 'scheduledStart', 'scheduledEnd', 'checkInMethod']}
                sortCol="scheduledDate"
                className="mt-5"
                query={tableQuery}
                idAccessor="_id"
                rowSelectionEnabled={false}
                showSidebar={showSidebar}
                sidebarTitle="Attendance record"
                onCloseSidebar={closeSidebar}
                sidebarContent={<AttendanceRecordDetail recordId={selectedId} />}
                buttons={
                    <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[160px]">
                                <FormSelect
                                    id="flt-faculty"
                                    label="Faculty"
                                    value={facultyId}
                                    onChange={(v) => {
                                        setFacultyId(v);
                                        setDepartmentId('');
                                        setClassId('');
                                        setCourseId('');
                                    }}
                                    onBlur={noopBlur}
                                    options={facultyOpts}
                                />
                            </div>
                            <div className="min-w-[160px]">
                                <FormSelect
                                    id="flt-dept"
                                    label="Department"
                                    value={departmentId}
                                    onChange={(v) => {
                                        setDepartmentId(v);
                                        setClassId('');
                                        setCourseId('');
                                    }}
                                    onBlur={noopBlur}
                                    options={departmentOpts}
                                />
                            </div>
                            <div className="min-w-[160px]">
                                <FormSelect id="flt-class" label="Class" value={classId} onChange={setClassId} onBlur={noopBlur} options={classOpts} />
                            </div>
                            <div className="min-w-[160px]">
                                <FormSelect id="flt-course" label="Course" value={courseId} onChange={setCourseId} onBlur={noopBlur} options={courseOpts} />
                            </div>
                            <div className="min-w-[180px]">
                                <FormSelect
                                    id="flt-instructor"
                                    label="Instructor"
                                    value={instructorId}
                                    onChange={setInstructorId}
                                    onBlur={noopBlur}
                                    options={lecturerOpts}
                                />
                            </div>
                            <div className="min-w-[150px]">
                                <FormSelect id="flt-status" label="Status" value={status} onChange={setStatus} onBlur={noopBlur} options={statusOpts} />
                            </div>
                            <div className="min-w-[150px]">
                                <FormSelect
                                    id="flt-method"
                                    label="Check-in method"
                                    value={checkInMethod}
                                    onChange={setCheckInMethod}
                                    onBlur={noopBlur}
                                    options={methodOpts}
                                />
                            </div>
                            <div className="min-w-[140px]">
                                <label htmlFor="flt-from" className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                    From date
                                </label>
                                <input
                                    id="flt-from"
                                    type="date"
                                    className="form-input h-10 w-full rounded-md border border-gray-200 dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] px-2 text-sm"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="min-w-[140px]">
                                <label htmlFor="flt-to" className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                    To date
                                </label>
                                <input
                                    id="flt-to"
                                    type="date"
                                    className="form-input h-10 w-full rounded-md border border-gray-200 dark:border-[#1b2e4b] bg-white dark:bg-[#0e1726] px-2 text-sm"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <button type="button" className="btn btn-outline-primary h-10 mt-5" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>
                    </div>
                }
            />
        </div>
    );
};

export default AttendanceRecordsPage;
