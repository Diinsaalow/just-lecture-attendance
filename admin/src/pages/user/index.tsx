import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { AppDispatch } from '../../store';
import { useBulkDeleteUsersMutation, useDeleteUserMutation, useGetAllUsersQuery, userApi } from '../../store/api/userApi';
import { useGetAllStudentsQuery, useDeleteStudentMutation, useBulkDeleteStudentsMutation, useDownloadAllStudentsMutation, studentApi } from '../../store/api/studentApi';
import { useGetAllInstructorsQuery, useDeleteInstructorMutation, useBulkDeleteInstructorsMutation, instructorApi } from '../../store/api/instructorApi';
import { IUser } from '../../types/auth';
import { ColumnConfig } from '../../types/columns';
import UserModal from './components/UserModal';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { IconTrash } from '@tabler/icons-react';
import { Download, Plus } from 'lucide-react';
import { storageUtil } from '../../utils/storage';
import UserDetail from './components/UserDetail';

const UserList = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [selectedRecords, setSelectedRecords] = useState<IUser[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<IUser | null>(null);

    const location = useLocation();

    // Determine listing type from URL: all | students | instructors (default: all)
    const lastSegment = (location.pathname.split('/').pop() || 'all').toLowerCase();
    const userType = ['all', 'students', 'instructors'].includes(lastSegment) ? lastSegment : 'all';

    // Use shared sidebar detail hook
    const { selectedId: selectedUserId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const { confirmDelete } = useConfirmDialog();

    // RTK Query hooks - use appropriate API based on user type
    const [deleteUser] = useDeleteUserMutation();
    const [bulkDeleteUsers] = useBulkDeleteUsersMutation();
    const [deleteStudent] = useDeleteStudentMutation();
    const [bulkDeleteStudents] = useBulkDeleteStudentsMutation();
    const [deleteInstructor] = useDeleteInstructorMutation();
    const [bulkDeleteInstructors] = useBulkDeleteInstructorsMutation();

    // Delete mutation - use appropriate API based on user type
    const handleDeleteUser = async (id: string) => {
        try {
            if (userType === 'students') {
                await deleteStudent(id).unwrap();
            } else if (userType === 'instructors') {
                await deleteInstructor(id).unwrap();
            } else {
                await deleteUser(id).unwrap();
            }
            toast.success('User deleted successfully');

            // If the deleted user was being viewed, close the sidebar
            if (selectedUserId) {
                closeSidebar();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    // Bulk Delete mutation - use appropriate API based on user type
    const handleBulkDeleteUsers = async (ids: string[]) => {
        try {
            let result;
            if (userType === 'students') {
                result = await bulkDeleteStudents(ids).unwrap();
            } else if (userType === 'instructors') {
                result = await bulkDeleteInstructors(ids).unwrap();
            } else {
                result = await bulkDeleteUsers(ids).unwrap();
            }
            toast.success(`${result.deletedCount} users deleted successfully`);

            // If any deleted user was being viewed, close the sidebar
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

    // RTK Query mutation for export
    const [downloadStudents, { isLoading: isDownloading }] = useDownloadAllStudentsMutation();

    const handleDownloadStudents = async () => {
        try {
            const result = await downloadStudents().unwrap();
            const filename = `students-${new Date().toISOString().slice(0, 10)}.csv`;

            const url = URL.createObjectURL(result);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            toast.error(e.message || 'Download failed');
        }
    };

    const openEditModal = (user: IUser) => {
        setUserToEdit(user);
        setIsOpen(true);
    };

    const handleViewUser = (user: IUser) => {
        openSidebar(user._id);
    };

    // Function to refresh data - use appropriate API based on user type
    const refreshData = () => {
        if (userType === 'students') {
            dispatch(studentApi.util.invalidateTags(['students']));
        } else if (userType === 'instructors') {
            dispatch(instructorApi.util.invalidateTags(['instructors']));
        } else {
            dispatch(userApi.util.invalidateTags(['users']));
        }
    };

    // Function to get record ID for bulk actions (convert string ID to number)
    const getRecordId = (record: IUser): number => {
        return parseInt(record._id, 10) || 0;
    };

    const columns: ColumnConfig<IUser>[] = [
        {
            accessor: 'firstName',
            title: 'First Name',
            type: 'text',
            sortable: true,
            render: ({ firstName, lastName }) => (
                <div className="font-medium">
                    {firstName || 'N/A'} {lastName || ''}
                </div>
            ),
        },
        {
            accessor: 'email',
            title: 'Email',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'role',
            title: 'Role',
            type: 'text',
            render: ({ role }) => <div>{typeof role == 'object' ? role.name : role}</div>,
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
                fetchData={userType === 'students' ? useGetAllStudentsQuery : userType === 'instructors' ? useGetAllInstructorsQuery : useGetAllUsersQuery}
                searchFields={['firstName', 'lastName', 'email', 'status']}
                sortCol="createdAt"
                query={userType === 'all' ? {} : {}}
                populate={[
                    {
                        path: 'role',
                        dir: 'roles',
                    },
                ]}
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
                        {userType === 'students' && (
                            <button type="button" className="btn btn-secondary gap-2" onClick={handleDownloadStudents}>
                                <Download size={16} />
                                Download Students
                            </button>
                        )}
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

            <UserModal isOpen={isOpen} setIsOpen={setIsOpen} userToEdit={userToEdit} userType={userType === 'students' ? 'student' : userType === 'instructors' ? 'instructor' : 'user'} />
        </div>
    );
};

export default UserList;
