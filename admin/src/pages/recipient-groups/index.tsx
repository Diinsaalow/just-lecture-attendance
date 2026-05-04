
import moment from 'moment';
import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useDeleteRecipientGroupMutation, useGetAllRecipientGroupsQuery, useBulkDeleteRecipientGroupsMutation } from '../../store/api/recipientGroupApi';
import { ColumnConfig } from '../../types/columns'; // Updated path
import { IRecipientGroup } from '../../types/recipientGroup';
import RecipientGroupForm from './components/RecipientGroupForm';
import RecipientGroupDetail from './components/RecipientGroupDetail';

const RecipientGroups = () => {
    const [recipientGroupToEdit, setRecipientGroupToEdit] = useState<IRecipientGroup | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedRecords, setSelectedRecords] = useState<IRecipientGroup[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteRecipientGroup] = useDeleteRecipientGroupMutation();
    const [bulkDeleteRecipientGroups] = useBulkDeleteRecipientGroupsMutation();

    const { selectedId: selectedGroupId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const breadcrumbItems = [
        {
            title: 'Dashboard',
            path: '/dashboard',
        },
        {
            title: 'Recipient Groups',
        },
    ];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteRecipientGroup(id).unwrap();
                toast.success('Recipient Group deleted successfully');
                if (selectedGroupId === id) {
                    closeSidebar();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete recipient group');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Recipient Groups',
            text: `Are you sure you want to delete ${selectedRecords.length} selected recipient groups?`,
        });

        if (confirmed) {
            try {
                const ids = selectedRecords.map((record) => record._id);
                // Call bulk delete API
                await bulkDeleteRecipientGroups(ids).unwrap();
                toast.success(`${selectedRecords.length} recipient groups deleted successfully`);
                if (selectedGroupId) {
                    closeSidebar();
                }
                setSelectedRecords([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete recipient groups');
            }
        }
    };

    const openCreateModal = () => {
        setRecipientGroupToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (group: IRecipientGroup) => {
        setRecipientGroupToEdit(group);
        setIsOpen(true);
    };

    const handleViewGroup = (group: IRecipientGroup) => {
        openSidebar(group._id);
    };

    const columns: ColumnConfig<IRecipientGroup>[] = [
        {
            accessor: 'name',
            title: 'Name',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'description',
            title: 'Description',
            type: 'text',
            sortable: true,
            render: ({ description }) => <div>{description || '-'}</div>,
        },
        {
            accessor: 'recipients',
            title: 'Recipients',
            type: 'text',
            sortable: false,
            render: ({ recipients }) => <div>{recipients?.length || 0}</div>,
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
                    onClick: (record) => handleViewGroup(record),
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

            <DataTableWithSidebar<IRecipientGroup>
                title="Recipient Groups"
                columns={columns}
                fetchData={useGetAllRecipientGroupsQuery}
                searchFields={['name', 'description']}
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
                sidebarTitle="Group Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<RecipientGroupDetail groupId={selectedGroupId} />}
                idAccessor="_id"
                getRecordId={(record) => record._id as any}
            />

            <RecipientGroupForm isOpen={isOpen} setIsOpen={setIsOpen} groupToEdit={recipientGroupToEdit} />
        </div>
    );
};

export default RecipientGroups;
