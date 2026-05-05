import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteFacultiesMutation, useDeleteFacultyMutation, useGetAllFacultiesQuery } from '../../store/api/facultyApi';
import type { IFaculty } from '../../types/faculty';
import type { ColumnConfig } from '../../types/columns';
import FacultyModal from './components/FacultyModal';
import FacultyDetail from './components/FacultyDetail';

const FacultyList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IFaculty | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IFaculty[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteFacultyMutation();
    const [bulkDelete] = useBulkDeleteFacultiesMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const campusCell = (r: IFaculty) =>
        typeof r.campusId === 'object' && r.campusId && 'campusName' in r.campusId ? (r.campusId as { campusName: string }).campusName : '-';

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
        if (await confirmDelete({ title: 'Delete faculties', text: `Delete ${selectedRecords.length} items?` })) {
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

    const columns: ColumnConfig<IFaculty>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'code', title: 'Code', type: 'text', sortable: true, render: (r) => <span>{r.code || '-'}</span> },
        { accessor: 'campusId', title: 'Campus', type: 'text', sortable: false, render: (r) => <span>{campusCell(r)}</span> },
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
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Faculties' }]} />
            <DataTableWithSidebar<IFaculty>
                title="Faculty Table"
                columns={columns}
                fetchData={useGetAllFacultiesQuery}
                searchFields={['name', 'description', 'code', 'status']}
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
                sidebarTitle="Faculty Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<FacultyDetail facultyId={selectedId} />}
            />
            <FacultyModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default FacultyList;
