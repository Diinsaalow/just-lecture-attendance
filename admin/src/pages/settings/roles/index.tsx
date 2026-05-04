import { IconTrash } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import DataTableWithSidebar from '../../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../../hooks/useSidebarDetail';
import { IRole } from '../../../types';
import { ColumnConfig } from '../../../types/columns';
import { useBulkDeleteRolesMutation, useDeleteRoleMutation, useGetAllRolesQuery } from '../../../store/api/roleApi';
import RoleDetail from './components/RoleDetail';
import RoleModal from './components/RoleModal';
import RolePermissionsSidebar from './components/RolePermissionsSidebar';

const RoleList = () => {
    const { t } = useTranslation();
    const [selectedRecords, setSelectedRecords] = useState<IRole[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<IRole | null>(null);

    const [viewRolePermissions, setViewRolePermissions] = useState<IRole | null>(null);

    // Use shared sidebar detail hook
    const { selectedId: selectedRoleId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const { confirmDelete } = useConfirmDialog();
    const [deleteRole] = useDeleteRoleMutation();
    const [bulkDeleteRoles] = useBulkDeleteRolesMutation();

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteRole(id).unwrap();
                toast.success('Role deleted successfully');
                if (selectedRoleId) closeSidebar();
            } catch (error: any) {
                console.error('Error deleting role:', error);

                // Extract error message from different possible error structures
                let errorMessage = 'Failed to delete role';

                if (error?.data) {
                    if (typeof error.data === 'string') {
                        errorMessage = error.data;
                    } else if (error.data.message) {
                        if (Array.isArray(error.data.message)) {
                            errorMessage = error.data.message.join(', ');
                        } else {
                            errorMessage = error.data.message;
                        }
                    } else if (error.data.error) {
                        errorMessage = error.data.error;
                    }
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                toast.error(errorMessage);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        // Filter out non-deletable roles
        const deletableRecords = selectedRecords.filter((record) => record.isDeletable !== false);
        const nonDeletableCount = selectedRecords.length - deletableRecords.length;

        if (deletableRecords.length === 0) {
            toast.error('None of the selected roles can be deleted');
            return;
        }

        let confirmText = `Are you sure you want to delete ${deletableRecords.length} selected roles?`;
        if (nonDeletableCount > 0) {
            confirmText += `\n\nNote: ${nonDeletableCount} role(s) cannot be deleted and will be skipped.`;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Roles',
            text: confirmText,
        });

        if (confirmed) {
            try {
                const ids = deletableRecords.map((record) => record._id);
                const res = await bulkDeleteRoles(ids).unwrap();
                toast.success(`${res.deletedCount} roles deleted successfully`);
                if (selectedRoleId) closeSidebar();
                setSelectedRecords([]);
            } catch (error: any) {
                console.error('Error bulk deleting roles:', error);

                // Extract error message from different possible error structures
                let errorMessage = 'Failed to delete roles';

                if (error?.data) {
                    if (typeof error.data === 'string') {
                        errorMessage = error.data;
                    } else if (error.data.message) {
                        if (Array.isArray(error.data.message)) {
                            errorMessage = error.data.message.join(', ');
                        } else {
                            errorMessage = error.data.message;
                        }
                    } else if (error.data.error) {
                        errorMessage = error.data.error;
                    }
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                toast.error(errorMessage);
            }
        }
    };

    const openCreateModal = () => {
        setRoleToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (role: IRole) => {
        setRoleToEdit(role);
        setIsOpen(true);
    };

    const handleViewRole = (role: IRole) => {
        openSidebar(role._id);
    };

    const getRecordId = (record: IRole): number => parseInt(record._id, 10) || 0;

    const columns: ColumnConfig<IRole>[] = [
        {
            accessor: 'name',
            title: 'Name',
            type: 'text',
            sortable: true,
            render: ({ name, isDeletable }) => (
                <div className="flex items-center gap-2">
                    <div className="font-medium">{name}</div>
                    {isDeletable === false && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Protected</span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'ability',
            title: 'Ability',
            type: 'text',
            sortable: false,
            render: ({ ability }) => (
                <div>
                    {ability && ability.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{ability.length} abilities</span>
                    ) : (
                        <span className="text-gray-500 text-sm">No ability</span>
                    )}
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
                    type: 'permissions',
                    onClick: (record: IRole) => {
                        setViewRolePermissions(record);
                    },
                    show: (record: IRole) => record.isDeletable !== false, // Only show if isDeletable is true or undefined
                },
                {
                    type: 'view',
                    onClick: (record) => handleViewRole(record),
                },
                {
                    type: 'edit',
                    onClick: (record) => openEditModal(record),
                    show: (record: IRole) => record.isDeletable !== false, // Only show if isDeletable is true or undefined
                },
                {
                    type: 'delete',
                    onClick: (record: IRole) => handleDelete(record._id),
                    show: (record: IRole) => record.isDeletable !== false, // Only show if isDeletable is true or undefined
                },
            ],
        },
    ];

    return (
        <div>
            <DataTableWithSidebar<IRole>
                title="Role Table"
                columns={columns}
                fetchData={useGetAllRolesQuery}
                searchFields={['name', 'status']}
                sortCol="createdAt"
                query={{}}
                rowSelectionEnabled={true}
                onSelectionChange={setSelectedRecords}
                searchable={true}
                exportable={{
                    enabled: true,
                    name: 'Roles',
                    formats: ['csv', 'excel', 'pdf'],
                }}
                className="mt-0"
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
                sidebarTitle="Role Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<RoleDetail roleId={selectedRoleId} />}
                getRecordId={getRecordId}
                idAccessor="_id"
            />

            <RoleModal isOpen={isOpen} setIsOpen={setIsOpen} roleToEdit={roleToEdit} />

            {viewRolePermissions && <RolePermissionsSidebar onClose={() => setViewRolePermissions(null)} role={viewRolePermissions} />}
        </div>
    );
};

export default RoleList;
