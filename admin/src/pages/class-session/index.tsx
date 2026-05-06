import moment from 'moment';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import FormSelect from '../../components/form/FormSelect';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { usePermission } from '../../hooks/usePermission';
import {
    useClassesForGenerationQuery,
    useGenerateClassSessionsMutation,
    useGetAllClassSessionsQuery,
    useSemestersForGenerationQuery,
} from '../../store/api/classSessionApi';
import type { IClassSession } from '../../types/classSession';
import type { ColumnConfig } from '../../types/columns';
import ClassSessionDetail from './components/ClassSessionDetail';

function cell(ref: unknown, key: string): string {
    if (typeof ref === 'object' && ref !== null && key in ref) return String((ref as Record<string, unknown>)[key]);
    return '-';
}

function hallLabel(hall: IClassSession['hallId']): string {
    if (!hall) return '-';
    if (typeof hall === 'string') return hall;
    const name = hall.name ?? '';
    const code = hall.code ? ` (${hall.code})` : '';
    return `${name}${code}`.trim() || '-';
}

const ClassSessionList = () => {
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();
    const { can } = usePermission();
    const canGenerate = can('create', 'ClassSession');

    const { data: classList = [], isError: classLoadError } = useClassesForGenerationQuery();
    const classOpts = React.useMemo(
        () => classList.map((c) => ({ value: c._id, label: c.name })),
        [classList],
    );

    const [classId, setClassId] = useState('');
    const { data: semList = [], isError: semLoadError } = useSemestersForGenerationQuery(classId, {
        skip: !classId,
    });

    const semOpts = React.useMemo(
        () => semList.map((s) => ({ value: s._id, label: s.name })),
        [semList],
    );
    const [semesterId, setSemesterId] = useState('');
    const [generate, { isLoading: generating }] = useGenerateClassSessionsMutation();

    const handleClassChange = (id: string) => {
        setClassId(id);
        setSemesterId('');
    };

    const handleGenerate = async () => {
        if (!classId) {
            toast.error('Choose a class');
            return;
        }
        if (!semesterId) {
            toast.error('Choose a semester');
            return;
        }
        try {
            const r = await generate({ semesterId, classId }).unwrap();
            toast.success(`Created ${r.upserted} new session(s); ${r.matchedExisting} already existed.`);
        } catch (e: unknown) {
            toast.error((e as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    const columns: ColumnConfig<IClassSession>[] = [
        {
            accessor: 'scheduledDate',
            title: 'Date',
            type: 'text',
            sortable: true,
            render: (r) => <span>{r.scheduledDate ? moment(r.scheduledDate).format('YYYY-MM-DD') : '-'}</span>,
        },
        { accessor: 'classId', title: 'Class', type: 'text', sortable: false, render: (r) => <span>{cell(r.classId, 'name')}</span> },
        { accessor: 'courseId', title: 'Course', type: 'text', sortable: false, render: (r) => <span>{cell(r.courseId, 'name')}</span> },
        { accessor: 'lecturerId', title: 'Lecturer', type: 'text', sortable: false, render: (r) => <span>{cell(r.lecturerId, 'username')}</span> },
        { accessor: 'semesterId', title: 'Semester', type: 'text', sortable: false, render: (r) => <span>{cell(r.semesterId, 'name')}</span> },
        { accessor: 'hallId', title: 'Hall', type: 'text', sortable: false, render: (r) => <span>{hallLabel(r.hallId)}</span> },
        { accessor: 'dayLabel', title: 'Day', type: 'text', sortable: true },
        { accessor: 'type', title: 'Type', type: 'text', sortable: true },
        { accessor: 'fromTime', title: 'From', type: 'text', sortable: true },
        { accessor: 'toTime', title: 'To', type: 'text', sortable: true },
        { accessor: 'status', title: 'Status', type: 'text', sortable: true },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            sortable: false,
            textAlignment: 'center',
            actions: [{ type: 'view', onClick: (r) => openSidebar(r._id) }],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Class sessions' }]} />
            <DataTableWithSidebar<IClassSession>
                title="Class sessions"
                columns={columns}
                fetchData={useGetAllClassSessionsQuery}
                searchFields={['dayLabel', 'fromTime', 'toTime', 'status', 'type']}
                sortCol="scheduledDate"
                className="mt-5"
                query={{}}
                idAccessor="_id"
                buttons={
                    canGenerate ? (
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[200px]">
                                <FormSelect
                                    id="gen-class"
                                    label="Class"
                                    value={classId}
                                    onChange={handleClassChange}
                                    onBlur={() => {}}
                                    options={[{ value: '', label: 'Select class…' }, ...classOpts]}
                                    disabled={generating}
                                />
                                {classLoadError ? (
                                    <p className="text-xs text-red-500 mt-1">Could not load classes.</p>
                                ) : null}
                                {!classLoadError && classOpts.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        No classes with timetable periods in your scope. Add periods first.
                                    </p>
                                ) : null}
                            </div>
                            <div className="min-w-[200px]">
                                <FormSelect
                                    id="gen-semester"
                                    label="Semester"
                                    value={semesterId}
                                    onChange={setSemesterId}
                                    onBlur={() => {}}
                                    options={[{ value: '', label: 'Select semester…' }, ...semOpts]}
                                    disabled={generating || !classId}
                                />
                                {semLoadError ? (
                                    <p className="text-xs text-red-500 mt-1">Could not load semesters.</p>
                                ) : null}
                                {classId && !semLoadError && semOpts.length === 0 ? (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        No semesters with periods for this class. Add periods for this class in a semester first.
                                    </p>
                                ) : null}
                            </div>
                            <button type="button" className="btn btn-primary h-10" disabled={generating} onClick={handleGenerate}>
                                {generating ? 'Generating…' : 'Generate from timetable'}
                            </button>
                        </div>
                    ) : undefined
                }
                showSidebar={showSidebar}
                sidebarTitle="Session details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<ClassSessionDetail classSessionId={selectedId} />}
            />
        </div>
    );
};

export default ClassSessionList;
