import { IconTrash } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteRecipientsMutation, useDeleteRecipientMutation, useGetAllRecipientsQuery } from '../../store/api/recipientApi';
import { ColumnConfig } from '../../types';
import { IRecipient } from '../../types/recipient';
import RecipientModal from './components/RecipientModal';
import RecipientDetail from './components/RecipientDetail';

const breadcrumbItems = [
    {
        title: 'Dashboard',
        path: '/dashboard',
    },
    {
        title: 'Recipients',
    },
];

const Recipients = () => {
    const [recipientToEdit, setRecipientToEdit] = useState<IRecipient | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecords, setSelectedRecords] = useState<IRecipient[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteRecipient] = useDeleteRecipientMutation();
    const [bulkDeleteRecipients] = useBulkDeleteRecipientsMutation();

    const { selectedId: selectedRecipientId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteRecipient(id).unwrap();
                toast.success('Recipient deleted successfully');
                if (selectedRecipientId === id) {
                    closeSidebar();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete recipient');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Recipients',
            text: `Are you sure you want to delete ${selectedRecords.length} selected recipients?`,
        });

        if (confirmed) {
            try {
                const ids = selectedRecords.map((record) => record._id);
                const result = await bulkDeleteRecipients(ids).unwrap();
                toast.success(`${result.deletedCount} recipients deleted successfully`);
                if (selectedRecipientId) {
                    closeSidebar();
                }
                setSelectedRecords([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete recipients');
            }
        }
    };

    const openCreateModal = () => {
        setRecipientToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (recipient: IRecipient) => {
        setRecipientToEdit(recipient);
        setIsOpen(true);
    };

    const handleViewRecipient = (recipient: IRecipient) => {
        openSidebar(recipient._id);
    };

    const columns: ColumnConfig<IRecipient>[] = [
        {
            accessor: 'phoneNumber',
            title: 'Phone Number',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'languageCode',
            title: 'Language',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'gender',
            title: 'Gender',
            type: 'text',
            sortable: true,
            render: ({ gender }) => <div className="capitalize">{gender || '-'}</div>,
        },
        {
            accessor: 'optInStatus',
            title: 'Opt In Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'true', label: 'Opted In', color: 'success' },
                { value: 'false', label: 'Opted Out', color: 'danger' },
            ],
            valueAccessor: (row) => ({
                value: row.optInStatus ? 'true' : 'false',
                label: row.optInStatus ? 'Opted In' : 'Opted Out',
                color: row.optInStatus ? 'success' : 'danger',
            }),
        },
        {
            accessor: 'isActive',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'inactive', label: 'Inactive', color: 'danger' },
            ],
            valueAccessor: (row) => ({
                value: row.isActive ? 'active' : 'inactive',
                label: row.isActive ? 'Active' : 'Inactive',
                color: row.isActive ? 'success' : 'danger',
            }),
        },
        {
            accessor: 'createdAt',
            title: 'Created At',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => <div>{createdAt ? moment(createdAt).format('MM/DD/YYYY') : '-'}</div>,
        },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            sortable: false,
            textAlignment: 'center',
            actions: [
                {
                    type: 'view',
                    onClick: (record) => handleViewRecipient(record),
                },
                {
                    type: 'edit',
                    onClick: (record) => openEditModal(record),
                },
                {
                    type: 'delete',
                    onClick: (record) => handleDelete(record._id),
                },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />

            <DataTableWithSidebar<IRecipient>
                title="Recipients"
                columns={columns}
                fetchData={useGetAllRecipientsQuery}
                searchFields={['phoneNumber', 'languageCode']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                rowSelectionEnabled={true}
                onSelectionChange={setSelectedRecords}
                bulkActions={[
                    {
                        label: 'Delete Selected',
                        icon: <IconTrash size={18} />,
                        color: 'red',
                        onClick: () => handleBulkDelete(),
                    },
                ]}
                buttons={
                    <button type="button" className="btn btn-primary gap-2" onClick={openCreateModal}>
                        <Plus size={16} />
                        Add New
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="Recipient Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<RecipientDetail recipientId={selectedRecipientId} />}
                idAccessor="_id"
                getRecordId={(record) => record._id as any}
            />

            <RecipientModal isOpen={isOpen} setIsOpen={setIsOpen} recipientToEdit={recipientToEdit} />
        </div>
    );
};

export default Recipients;