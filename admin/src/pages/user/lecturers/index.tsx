import moment from 'moment';
import { useState } from 'react';
import { toast } from 'sonner';
import Breadcrumb from '../../../components/Breadcrumb';
import DataTableWithSidebar from '../../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../../hooks/useSidebarDetail';
import {
    useBulkDeleteLecturersMutation,
    useDeleteLecturerMutation,
    useGetAllLecturersQuery,
} from '../../../store/api/lecturerApi';
import type { IUser } from '../../../types/auth';
import type { ColumnConfig } from '../../../types/columns';
import { formatJamhuriyaUsername } from '../../../utils/jamhuriyaUsername';
import { IconTrash } from '@tabler/icons-react';
import { Plus } from 'lucide-react';
import LecturerModal from './components/LecturerModal';
import LecturerDetail from './components/LecturerDetail';

const LecturersPage = () => {
    const [selectedRecords, setSelectedRecords] = useState<IUser[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<IUser | null>(null);

    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();
    const { confirmDelete } = useConfirmDialog();

    const [deleteLecturer] = useDeleteLecturerMutation();
    const [bulkDelete] = useBulkDeleteLecturersMutation();

    const handleDelete = async (id: string) => {
        if (await confirmDelete()) {
            try {
                await deleteLecturer(id).unwrap();
                toast.success('Deleted');
                if (selectedId === id) closeSidebar();
            } catch (error: unknown) {
                const msg =
                    typeof error === 'object' && error !== null && 'data' in error
                        ? String((error as { data?: { message?: string } }).data?.message)
                        : '';
                toast.error(msg || 'Failed');
            }
        }
    };

    const handleBulk = async () => {
        if (!selectedRecords.length) {
            toast.error('Select items');
            return;
        }
        if (await confirmDelete({ text: `Delete ${selectedRecords.length} lecturers?` })) {
            try {
                const r = await bulkDelete(selectedRecords.map((x) => x._id)).unwrap();
                toast.success(`${r.deletedCount ?? 0} deleted`);
                if (selectedId) closeSidebar();
                setSelectedRecords([]);
            } catch (error: unknown) {
                const msg =
                    typeof error === 'object' && error !== null && 'data' in error
                        ? String((error as { data?: { message?: string } }).data?.message)
                        : '';
                toast.error(msg || 'Failed');
            }
        }
    };

    const columns: ColumnConfig<IUser>[] = [
        {
            accessor: 'username',
            title: 'Username',
            type: 'text',
            sortable: true,
            render: ({ username }) => <span className="font-mono">{formatJamhuriyaUsername(username || '')}</span>,
        },
        {
            accessor: 'firstName',
            title: 'Name',
            type: 'text',
            sortable: true,
            render: ({ firstName, lastName, username }) => (
                <span>{firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : username}</span>
            ),
        },
        {
            accessor: 'facultyId',
            title: 'Faculty',
            type: 'text',
            sortable: false,
            render: (r) => (
                <span>
                    {r.facultyId && typeof r.facultyId === 'object' && 'name' in r.facultyId
                        ? (r.facultyId as { name: string }).name
                        : '—'}
                </span>
            ),
        },
        { accessor: 'phone', title: 'Phone', type: 'text', sortable: false },
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
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Users', path: '/users' }, { title: 'Lecturers' }]} />
            <DataTableWithSidebar<IUser>
                title="Lecturers"
                columns={columns}
                fetchData={useGetAllLecturersQuery}
                searchFields={['username', 'firstName', 'lastName', 'email', 'phone']}
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
                        Add lecturer
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="Lecturer details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<LecturerDetail lecturerId={selectedId} />}
            />
            <LecturerModal isOpen={isOpen} setIsOpen={setIsOpen} itemToEdit={itemToEdit} />
        </div>
    );
};

export default LecturersPage;
