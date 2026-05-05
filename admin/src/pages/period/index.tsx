import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeletePeriodsMutation, useDeletePeriodMutation, useGetAllPeriodsQuery } from '../../store/api/periodApi';
import type { IPeriod } from '../../types/period';
import type { ColumnConfig } from '../../types/columns';
import PeriodModal from './components/PeriodModal';
import PeriodDetail from './components/PeriodDetail';

function cell(ref: unknown, key: string): string {
    if (typeof ref === 'object' && ref !== null && key in ref) return String((ref as Record<string, unknown>)[key]);
    return '-';
}

const PeriodList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IPeriod | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IPeriod[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeletePeriodMutation();
    const [bulkDelete] = useBulkDeletePeriodsMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

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
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} periods?` })) {
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

    const columns: ColumnConfig<IPeriod>[] = [
        { accessor: 'classId', title: 'Class', type: 'text', sortable: false, render: (r) => <span>{cell(r.classId, 'name')}</span> },
        { accessor: 'courseId', title: 'Course', type: 'text', sortable: false, render: (r) => <span>{cell(r.courseId, 'name')}</span> },
        { accessor: 'lecturerId', title: 'Lecturer', type: 'text', sortable: false, render: (r) => <span>{cell(r.lecturerId, 'username')}</span> },
        { accessor: 'semesterId', title: 'Semester', type: 'text', sortable: false, render: (r) => <span>{cell(r.semesterId, 'name')}</span> },
        { accessor: 'day', title: 'Day', type: 'text', sortable: true },
        { accessor: 'type', title: 'Type', type: 'text', sortable: true },
        { accessor: 'from', title: 'From', type: 'text', sortable: true },
        { accessor: 'to', title: 'To', type: 'text', sortable: true },
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
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Periods' }]} />
            <DataTableWithSidebar<IPeriod>
                title="Period Table"
                columns={columns}
                fetchData={useGetAllPeriodsQuery}
                searchFields={['day', 'type', 'from', 'to', 'status']}
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
                sidebarTitle="Period Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<PeriodDetail periodId={selectedId} />}
            />
            <PeriodModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default PeriodList;
