import moment from 'moment';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import FormSelect from '../../components/form/FormSelect';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { usePermission } from '../../hooks/usePermission';
import {
    useBulkDeleteClassSessionsMutation,
    useClassesForGenerationQuery,
    useDeleteClassSessionMutation,
    useGenerateClassSessionsMutation,
    useGetAllClassSessionsQuery,
    useSemestersForGenerationQuery,
} from '../../store/api/classSessionApi';
import type { IClassSession } from '../../types/classSession';
import type { ActionConfig, ColumnConfig } from '../../types/columns';
import ClassSessionDetail from './components/ClassSessionDetail';
import ClassSessionModal from './components/ClassSessionModal';

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
    const canCreate = can('create', 'ClassSession');
    const canGenerate = canCreate;
    const canUpdate = can('update', 'ClassSession');
    const canDelete = can('delete', 'ClassSession');
    const { confirmDelete } = useConfirmDialog();

    const { data: classList = [], isError: classLoadError } = useClassesForGenerationQuery();
    const classOpts = React.useMemo(() => classList.map((c) => ({ value: c._id, label: c.name })), [classList]);

    const [classId, setClassId] = useState('');
    const { data: semList = [], isError: semLoadError } = useSemestersForGenerationQuery(classId, {
        skip: !classId,
    });
    const semOpts = React.useMemo(() => semList.map((s) => ({ value: s._id, label: s.name })), [semList]);

    const [semesterId, setSemesterId] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IClassSession | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IClassSession[]>([]);
    const [generate, { isLoading: generating }] = useGenerateClassSessionsMutation();
    const [deleteItem] = useDeleteClassSessionMutation();
    const [bulkDelete] = useBulkDeleteClassSessionsMutation();

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
            const result = await generate({ semesterId, classId }).unwrap();
            toast.success(`Created ${result.upserted} new session(s); ${result.matchedExisting} already existed.`);
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirmDelete()) {
            try {
                await deleteItem(id).unwrap();
                toast.success('Class session deleted');
                if (selectedId === id) closeSidebar();
            } catch (error: unknown) {
                toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedRecords.length) {
            toast.error('Select class sessions');
            return;
        }
        if (await confirmDelete({ title: 'Delete multiple', text: `Delete ${selectedRecords.length} class sessions?` })) {
            try {
                const result = await bulkDelete(selectedRecords.map((row) => row._id)).unwrap();
                toast.success(`${result.deletedCount} class session(s) deleted`);
                if (selectedId) closeSidebar();
                setSelectedRecords([]);
            } catch (error: unknown) {
                toast.error((error as { data?: { message?: string } })?.data?.message || 'Bulk delete failed');
            }
        }
    };

    const actions: ActionConfig<IClassSession>[] = [{ type: 'view', onClick: (row) => openSidebar(row._id) }];
    if (canUpdate) {
        actions.push({
            type: 'edit',
            onClick: (row) => {
                setItemToEdit(row);
                setIsOpen(true);
            },
        });
    }
    if (canDelete) {
        actions.push({ type: 'delete', onClick: (row) => handleDelete(row._id) });
    }

    const columns: ColumnConfig<IClassSession>[] = [
        {
            accessor: 'scheduledDate',
            title: 'Date',
            type: 'text',
            sortable: true,
            render: (row) => <span>{row.scheduledDate ? moment(row.scheduledDate).format('YYYY-MM-DD') : '-'}</span>,
        },
        { accessor: 'classId', title: 'Class', type: 'text', sortable: false, render: (row) => <span>{cell(row.classId, 'name')}</span> },
        { accessor: 'courseId', title: 'Course', type: 'text', sortable: false, render: (row) => <span>{cell(row.courseId, 'name')}</span> },
        { accessor: 'lecturerId', title: 'Lecturer', type: 'text', sortable: false, render: (row) => <span>{cell(row.lecturerId, 'username')}</span> },
        { accessor: 'semesterId', title: 'Semester', type: 'text', sortable: false, render: (row) => <span>{cell(row.semesterId, 'name')}</span> },
        { accessor: 'hallId', title: 'Hall', type: 'text', sortable: false, render: (row) => <span>{hallLabel(row.hallId)}</span> },
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
            actions,
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
                rowSelectionEnabled={canDelete}
                onSelectionChange={setSelectedRecords}
                bulkActions={canDelete ? [{ label: 'Delete Selected', icon: <IconTrash size={18} />, color: 'red', onClick: () => handleBulkDelete() }] : undefined}
                idAccessor="_id"
                buttons={
                    canCreate || canGenerate ? (
                        <div className="flex flex-wrap items-end gap-3">
                            {canCreate ? (
                                <button
                                    type="button"
                                    className="btn btn-primary gap-2 h-10"
                                    onClick={() => {
                                        setItemToEdit(null);
                                        setIsOpen(true);
                                    }}
                                >
                                    <Plus size={16} />
                                    Add New
                                </button>
                            ) : null}
                            {canGenerate ? (
                                <>
                                    <div className="min-w-[200px]">
                                        <FormSelect
                                            id="gen-class"
                                            label="Class"
                                            value={classId}
                                            onChange={handleClassChange}
                                            onBlur={() => {}}
                                            options={[{ value: '', label: 'Select class...' }, ...classOpts]}
                                            disabled={generating}
                                        />
                                        {classLoadError ? <p className="text-xs text-red-500 mt-1">Could not load classes.</p> : null}
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
                                            options={[{ value: '', label: 'Select semester...' }, ...semOpts]}
                                            disabled={generating || !classId}
                                        />
                                        {semLoadError ? <p className="text-xs text-red-500 mt-1">Could not load semesters.</p> : null}
                                        {classId && !semLoadError && semOpts.length === 0 ? (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                No semesters with periods for this class. Add periods for this class in a semester first.
                                            </p>
                                        ) : null}
                                    </div>
                                    <button type="button" className="btn btn-outline-primary h-10" disabled={generating} onClick={handleGenerate}>
                                        {generating ? 'Generating...' : 'Generate from timetable'}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    ) : undefined
                }
                showSidebar={showSidebar}
                sidebarTitle="Session details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<ClassSessionDetail classSessionId={selectedId} />}
            />
            <ClassSessionModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default ClassSessionList;
