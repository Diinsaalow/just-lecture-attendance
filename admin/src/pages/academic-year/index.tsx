import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteAcademicYearsMutation, useDeleteAcademicYearMutation, useGetAllAcademicYearsQuery } from '../../store/api/academicYearApi';
import type { IAcademicYear } from '../../types/academicYear';
import type { ColumnConfig } from '../../types/columns';
import AcademicYearModal from './components/AcademicYearModal';
import AcademicYearDetail from './components/AcademicYearDetail';

const AcademicYearList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IAcademicYear | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<IAcademicYear[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteItem] = useDeleteAcademicYearMutation();
    const [bulkDelete] = useBulkDeleteAcademicYearsMutation();
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const breadcrumbItems = [{ title: 'Dashboard', path: '/' }, { title: 'Academic Years' }];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteItem(id).unwrap();
                toast.success('Deleted successfully');
                if (selectedId === id) closeSidebar();
            } catch (error: unknown) {
                const msg = (error as { data?: { message?: string } })?.data?.message;
                toast.error(msg || 'Delete failed');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items');
            return;
        }
        const confirmed = await confirmDelete({
            title: 'Delete multiple',
            text: `Delete ${selectedRecords.length} academic years?`,
        });
        if (confirmed) {
            try {
                const ids = selectedRecords.map((r) => r._id);
                const result = await bulkDelete(ids).unwrap();
                toast.success(`${result.deletedCount} deleted`);
                if (selectedId) closeSidebar();
                setSelectedRecords([]);
            } catch (error: unknown) {
                const msg = (error as { data?: { message?: string } })?.data?.message;
                toast.error(msg || 'Bulk delete failed');
            }
        }
    };

    const columns: ColumnConfig<IAcademicYear>[] = [
        { accessor: 'name', title: 'Name', type: 'text', sortable: true },
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
            <Breadcrumb items={breadcrumbItems} />
            <DataTableWithSidebar<IAcademicYear>
                title="Academic Year Table"
                columns={columns}
                fetchData={useGetAllAcademicYearsQuery}
                searchFields={['name', 'status']}
                sortCol="startDate"
                className="mt-5"
                query={{}}
                rowSelectionEnabled
                onSelectionChange={setSelectedRecords}
                bulkActions={[
                    {
                        label: 'Delete Selected',
                        icon: <IconTrash size={18} />,
                        color: 'red',
                        onClick: () => handleBulkDelete(),
                    },
                ]}
                idAccessor="_id"
                buttons={
                    <button
                        type="button"
                        className="btn btn-primary gap-2"
                        onClick={() => {
                            setItemToEdit(null);
                            setIsOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        Add New
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="Academic Year Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<AcademicYearDetail academicYearId={selectedId} />}
            />
            <AcademicYearModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default AcademicYearList;
