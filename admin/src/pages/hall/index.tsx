import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { usePermission } from '../../hooks/usePermission';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteHallsMutation, useDeleteHallMutation, useGetAllHallsQuery } from '../../store/api/hallApi';
import type { IHall } from '../../types/hall';
import type { ColumnConfig } from '../../types/columns';
import HallModal from './components/HallModal';
import HallDetail from './components/HallDetail';

function cellCampus(ref: IHall['campusId']): string {
    if (typeof ref === 'object' && ref !== null && 'campusName' in ref) {
        return ref.campusName;
    }
    return '-';
}

const HallList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IHall | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IHall[]>([]);
    const { confirmDelete } = useConfirmDialog();
    const { can } = usePermission();

    const [deleteItem] = useDeleteHallMutation();
    const [bulkDelete] = useBulkDeleteHallsMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const handleDelete = async (id: string) => {
        if (!can('delete', 'Hall')) return;
        if (await confirmDelete()) {
            try {
                await deleteItem(id).unwrap();
                toast.success('Deleted');
                if (selectedId === id) closeSidebar();
            } catch (error: unknown) {
                toast.error((error as { data?: { message?: string } })?.data?.message || 'Delete failed');
            }
        }
    };

    const handleBulk = async () => {
        if (!can('delete', 'Hall')) return;
        if (!selectedRecords.length) {
            toast.error('Select items');
            return;
        }
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} halls?` })) {
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

    const columns: ColumnConfig<IHall>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
        { accessor: 'code', title: 'Code', type: 'text', sortable: true },
        { accessor: 'campusId', title: 'Campus', type: 'text', sortable: false, render: (r) => <span>{cellCampus(r.campusId)}</span> },
        {
            accessor: 'capacity',
            title: 'Capacity',
            type: 'text',
            sortable: true,
            render: (r) => <span>{r.capacity != null ? r.capacity : '-'}</span>,
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
                ...(can('update', 'Hall')
                    ? [
                          {
                              type: 'edit' as const,
                              onClick: (r: IHall) => {
                                  setItemToEdit(r);
                                  setIsOpen(true);
                              },
                          },
                      ]
                    : []),
                ...(can('delete', 'Hall') ? [{ type: 'delete' as const, onClick: (r: IHall) => handleDelete(r._id) }] : []),
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Halls' }]} />
            <DataTableWithSidebar<IHall>
                title="Halls"
                columns={columns}
                fetchData={useGetAllHallsQuery}
                searchFields={['name', 'code', 'status']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                rowSelectionEnabled={can('delete', 'Hall')}
                onSelectionChange={setSelectedRecords}
                bulkActions={
                    can('delete', 'Hall')
                        ? [{ label: 'Delete Selected', icon: <IconTrash size={18} />, color: 'red', onClick: () => handleBulk() }]
                        : []
                }
                idAccessor="_id"
                buttons={
                    can('create', 'Hall') ? (
                        <button
                            type="button"
                            className="btn btn-primary gap-2"
                            onClick={() => {
                                setItemToEdit(null);
                                setIsOpen(true);
                            }}
                        >
                            <Plus size={16} />
                            Add Hall
                        </button>
                    ) : undefined
                }
                showSidebar={showSidebar}
                sidebarTitle="Hall Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<HallDetail hallId={selectedId} />}
            />
            <HallModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default HallList;
