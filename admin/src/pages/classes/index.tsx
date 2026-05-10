import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteLectureClassesMutation, useDeleteLectureClassMutation, useGetAllLectureClassesQuery } from '../../store/api/lectureClassApi';
import type { ILectureClass } from '../../types/lectureClass';
import type { ColumnConfig } from '../../types/columns';
import LectureClassModal from './components/LectureClassModal';
import LectureClassDetail from './components/LectureClassDetail';
import ClassPeriodsSidebar from './components/ClassPeriodsSidebar';
import { Calendar } from 'lucide-react';

const ClassesList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ILectureClass | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ILectureClass[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteLectureClassMutation();
    const [bulkDelete] = useBulkDeleteLectureClassesMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const [showTimetable, setShowTimetable] = useState(false);
    const [timetableClass, setTimetableClass] = useState<{ id: string; name: string } | null>(null);

    const openTimetable = (id: string, name: string) => {
        setTimetableClass({ id, name });
        setShowTimetable(true);
    };

    const dep = (r: ILectureClass) =>
        typeof r.departmentId === 'object' && r.departmentId && 'name' in r.departmentId ? (r.departmentId as { name: string }).name : '-';

    const handleDelete = async (id: string) => {
        if (await confirmDelete()) {
            try {
                await deleteItem(id).unwrap();
                toast.success('Deleted');
                if (selectedId === id) closeSidebar();
            } catch (error: unknown) {
                toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
            }
        }
    };

    const handleBulk = async () => {
        if (!selectedRecords.length) {
            toast.error('Select items');
            return;
        }
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} classes?` })) {
            try {
                const r = await bulkDelete(selectedRecords.map((x) => x._id)).unwrap();
                toast.success(`${r.deletedCount} deleted`);
                if (selectedId) closeSidebar();
                setSelectedRecords([]);
            } catch (error: unknown) {
                toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
            }
        }
    };

    const columns: ColumnConfig<ILectureClass>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'departmentId', title: 'Department', type: 'text', sortable: false, render: (r) => <span>{dep(r)}</span> },
        { accessor: 'mode', title: 'Mode', type: 'text', sortable: true },
        { accessor: 'shift', title: 'Shift', type: 'text', sortable: true },
        { accessor: 'size', title: 'Size', type: 'text', sortable: true },
        { accessor: 'batchId', title: 'Batch', type: 'text', sortable: true },
        { accessor: 'status', title: 'Status', type: 'text', sortable: true },
        {
            accessor: 'createdAt',
            title: 'Created',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => <span>{createdAt ? moment(createdAt).format('MM/DD/YYYY') : '-'}</span>,
        },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            sortable: false,
            textAlignment: 'center',
            actions: [
                { type: 'view', onClick: (r) => openSidebar(r._id) },
                {
                    type: 'edit',
                    onClick: (r) => {
                        setItemToEdit(r);
                        setIsOpen(true);
                    },
                },
                {
                    type: 'custom',
                    icon: <Calendar className="w-4 h-4" />,
                    tooltip: 'View Timetable',
                    onClick: (r) => openTimetable(r._id, r.name),
                },
                { type: 'delete', onClick: (r) => handleDelete(r._id) },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Classes' }]} />
            <DataTableWithSidebar<ILectureClass>
                title="Classes Table"
                columns={columns}
                fetchData={useGetAllLectureClassesQuery}
                searchFields={['name', 'mode', 'shift', 'batchId', 'status']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                rowSelectionEnabled
                onSelectionChange={setSelectedRecords}
                bulkActions={[{ label: 'Delete Selected', icon: <IconTrash size={18} />, color: 'red', onClick: () => handleBulk() }]}
                idAccessor="_id"
                buttons={
                    <button type="button" className="btn btn-primary gap-2" onClick={() => { setItemToEdit(null); setIsOpen(true); }}>
                        <Plus size={16} />
                        Add New
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="Class Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<LectureClassDetail classId={selectedId} />}
            />
            <LectureClassModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
            <ClassPeriodsSidebar
                isOpen={showTimetable}
                setIsOpen={setShowTimetable}
                classId={timetableClass?.id || null}
                className={timetableClass?.name}
            />
        </div>
    );
};

export default ClassesList;
