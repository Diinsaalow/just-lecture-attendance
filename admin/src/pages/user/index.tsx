import moment from 'moment';
import { useState } from 'react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useBulkDeleteUsersMutation, useDeleteUserMutation, useGetAllUsersQuery } from '../../store/api/userApi';
import { IUser } from '../../types/auth';
import { ColumnConfig } from '../../types/columns';
import UserModal from './components/UserModal';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { IconTrash } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import UserDetail from './components/UserDetail';

const UserList = () => {
    const [selectedRecords, setSelectedRecords] = useState<IUser[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<IUser | null>(null);

    // Use shared sidebar detail hook
    const { selectedId: selectedUserId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const { confirmDelete } = useConfirmDialog();

    // RTK Query hooks
    const [deleteUser] = useDeleteUserMutation();
    const [bulkDeleteUsers] = useBulkDeleteUsersMutation();

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUser(id).unwrap();
            toast.success('User deleted successfully');

            if (selectedUserId) {
                closeSidebar();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const handleBulkDeleteUsers = async (ids: string[]) => {
        try {
            const result = await bulkDeleteUsers(ids).unwrap();
            toast.success(`${result.deletedCount} users deleted successfully`);

            if (selectedUserId) {
                closeSidebar();
            }
            setSelectedRecords([]);
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete users');
        }
    };

    const breadcrumbItems = [{ title: 'Dashboard', path: '/' }, { title: 'Users' }];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            handleDeleteUser(id);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Users',
            text: `Are you sure you want to delete ${selectedRecords.length} selected users?`,
        });

        if (confirmed) {
            const ids = selectedRecords.map((record) => record._id);
            handleBulkDeleteUsers(ids);
        }
    };

    const openCreateModal = () => {
        setUserToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (user: IUser) => {
        setUserToEdit(user);
        setIsOpen(true);
    };

    const handleViewUser = (user: IUser) => {
        openSidebar(user._id);
    };

    // Function to get record ID for bulk actions
    const getRecordId = (record: IUser): number => {
        return (record as any).id || 0; // Or whatever numeric id if needed, otherwise string is fine for bulkDelete if handled
    };

    const columns: ColumnConfig<IUser>[] = [
        {
            accessor: 'firstName',
            title: 'First Name',
            type: 'text',
            sortable: true,
            render: ({ firstName, lastName, username }) => (
                <div className="font-medium">
                    {firstName || lastName ? `${firstName || ''} ${lastName || ''}` : username}
                </div>
            ),
        },
        {
            accessor: 'email',
            title: 'Email',
            type: 'text',
            sortable: true,
            render: ({ email, username }) => <div>{email || username}</div>,
        },
        {
            accessor: 'role',
            title: 'Role',
            type: 'text',
            render: ({ role }) => (
                <div>
                    {role != null && typeof role === 'object'
                        ? (role as { name?: string }).name ?? '—'
                        : role != null
                          ? String(role)
                          : '—'}
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'inactive', label: 'Inactive', color: 'danger' },
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'suspended', label: 'Suspended', color: 'warning' },
            ],
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
                    onClick: (record) => handleViewUser(record),
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

            <DataTableWithSidebar<IUser>
                title="User Table"
                columns={columns}
                fetchData={useGetAllUsersQuery}
                searchFields={['firstName', 'lastName', 'email', 'username']}
                sortCol="createdAt"
                query={{}}
                populate={[{ path: 'role', select: 'name' }]}
                rowSelectionEnabled={true}
                onSelectionChange={setSelectedRecords}
                searchable={true}
                exportable={{
                    enabled: true,
                    name: 'Users',
                    formats: ['csv', 'excel', 'pdf'],
                }}
                className="mt-5"
                bulkActions={[
                    {
                        label: 'Delete Selected',
                        icon: <IconTrash size={18} />,
                        color: 'red',
                        onClick: () => handleBulkDelete(),
                    },
                ]}
                buttons={
                    <>
                        <button type="button" className="btn btn-primary gap-2" onClick={openCreateModal}>
                            <Plus size={16} />
                            Add New
                        </button>
                    </>
                }
                showSidebar={showSidebar}
                sidebarTitle="User Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<UserDetail userId={selectedUserId} />}
                getRecordId={getRecordId}
                idAccessor="_id"
            />

            <UserModal isOpen={isOpen} setIsOpen={setIsOpen} userToEdit={userToEdit} />
        </div>
    );
};

export default UserList;
