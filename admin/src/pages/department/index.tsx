import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteDepartmentsMutation, useDeleteDepartmentMutation, useGetAllDepartmentsQuery } from '../../store/api/departmentApi';
import type { IDepartment } from '../../types/department';
import type { ColumnConfig } from '../../types/columns';
import DepartmentModal from './components/DepartmentModal';
import DepartmentDetail from './components/DepartmentDetail';

const DepartmentList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IDepartment | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IDepartment[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteDepartmentMutation();
    const [bulkDelete] = useBulkDeleteDepartmentsMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const facName = (r: IDepartment) =>
        typeof r.facultyId === 'object' && r.facultyId && 'name' in r.facultyId ? (r.facultyId as { name: string }).name : '-';

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
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} departments?` })) {
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

    const columns: ColumnConfig<IDepartment>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'facultyId', title: 'Faculty', type: 'text', sortable: false, render: (r) => <span>{facName(r)}</span> },
        { accessor: 'abbreviation', title: 'Abbr', type: 'text', sortable: true },
        { accessor: 'degree', title: 'Degree', type: 'text', sortable: true },
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
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Departments' }]} />
            <DataTableWithSidebar<IDepartment>
                title="Department Table"
                columns={columns}
                fetchData={useGetAllDepartmentsQuery}
                searchFields={['name', 'graduationName', 'duration', 'abbreviation', 'degree', 'status']}
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
                sidebarTitle="Department Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<DepartmentDetail departmentId={selectedId} />}
            />
            <DepartmentModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default DepartmentList;
