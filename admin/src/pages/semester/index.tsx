import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteSemestersMutation, useDeleteSemesterMutation, useGetAllSemestersQuery } from '../../store/api/semesterApi';
import type { ISemester } from '../../types/semester';
import type { ColumnConfig } from '../../types/columns';
import SemesterModal from './components/SemesterModal';
import SemesterDetail from './components/SemesterDetail';

const SemesterList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<ISemester | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ISemester[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteSemesterMutation();
    const [bulkDelete] = useBulkDeleteSemestersMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const ayCell = (r: ISemester) =>
        typeof r.academicYearId === 'object' && r.academicYearId && 'name' in r.academicYearId ? (r.academicYearId as { name: string }).name : '-';

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
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} semesters?` })) {
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

    const columns: ColumnConfig<ISemester>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'academicYearId', title: 'Academic year', type: 'text', sortable: false, render: (r) => <span>{ayCell(r)}</span> },
        {
            accessor: 'startDate',
            title: 'Start',
            type: 'date',
            sortable: true,
            render: ({ startDate }) => <span>{startDate ? moment(startDate).format('MM/DD/YYYY') : '-'}</span>,
        },
        {
            accessor: 'endDate',
            title: 'End',
            type: 'date',
            sortable: true,
            render: ({ endDate }) => <span>{endDate ? moment(endDate).format('MM/DD/YYYY') : '-'}</span>,
        },
        { accessor: 'status', title: 'Status', type: 'text', sortable: true },
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
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Semesters' }]} />
            <DataTableWithSidebar<ISemester>
                title="Semester Table"
                columns={columns}
                fetchData={useGetAllSemestersQuery}
                searchFields={['name', 'status']}
                sortCol="startDate"
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
                sidebarTitle="Semester Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<SemesterDetail semesterId={selectedId} />}
            />
            <SemesterModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default SemesterList;
