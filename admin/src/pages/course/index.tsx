import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteCoursesMutation, useDeleteCourseMutation, useGetAllCoursesQuery } from '../../store/api/courseApi';
import type { ICourse } from '../../types/course';
import type { ColumnConfig } from '../../types/columns';
import CourseModal from './components/CourseModal';
import CourseDetail from './components/CourseDetail';

const CourseList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ICourse | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ICourse[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteCourseMutation();
    const [bulkDelete] = useBulkDeleteCoursesMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const deptName = (r: ICourse) =>
        typeof r.departmentId === 'object' && r.departmentId && 'name' in r.departmentId ? (r.departmentId as { name: string }).name : '-';

    const lecturerCount = (r: ICourse) => (Array.isArray(r.lecturers) ? r.lecturers.length : 0);

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
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} courses?` })) {
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

    const columns: ColumnConfig<ICourse>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'departmentId', title: 'Department', type: 'text', sortable: false, render: (r) => <span>{deptName(r)}</span> },
        { accessor: 'type', title: 'Type', type: 'text', sortable: true },
        {
            accessor: 'credit',
            title: 'Credit',
            type: 'text',
            sortable: true,
            render: ({ credit }) => <span>{credit ?? '-'}</span>,
        },
        {
            accessor: 'lecturers',
            title: 'Lecturers',
            type: 'text',
            sortable: false,
            render: (r) => <span>{lecturerCount(r)}</span>,
        },
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
                { type: 'delete', onClick: (r) => handleDelete(r._id) },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Courses' }]} />
            <DataTableWithSidebar<ICourse>
                title="Course Table"
                columns={columns}
                fetchData={useGetAllCoursesQuery}
                searchFields={['name', 'type', 'status']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                populate={[{ path: 'departmentId', select: 'name' }]}
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
                sidebarTitle="Course Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<CourseDetail courseId={selectedId} />}
            />
            <CourseModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default CourseList;
