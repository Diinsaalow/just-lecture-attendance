import moment from 'moment';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { IconTrash } from '@tabler/icons-react';
import { Plus, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import {
    useGetAllSmsMessagesQuery,
    useDeleteSmsMessageMutation,
    useBulkDeleteSmsMessagesMutation,
    useGetSmsMessageByIdQuery
} from '../../store/api/smsMessageApi';
import { ISmsMessage } from '../../types/smsMessage';
import { ColumnConfig } from '../../types/columns';
import { setPageTitle } from '../../store/themeConfigSlice';
import SmsMessageForm from './components/SmsMessageForm';
import SmsMessageDetail from './components/SmsMessageDetail';
import RescheduleModal from './components/RescheduleModal';

const SmsMessages = () => {
    const dispatch = useDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [messageToEdit, setMessageToEdit] = useState<ISmsMessage | null>(null);
    const [messageToReschedule, setMessageToReschedule] = useState<ISmsMessage | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ISmsMessage[]>([]);

    useEffect(() => {
        dispatch(setPageTitle('SMS Messages'));
    }, [dispatch]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteMessage] = useDeleteSmsMessageMutation();
    const [bulkDeleteMessages] = useBulkDeleteSmsMessagesMutation();

    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    // Fetch individual message details for the sidebar
    const { data: selectedMessage } = useGetSmsMessageByIdQuery(selectedId || '', { skip: !selectedId });

    const breadcrumbItems = [
        { title: 'Dashboard', path: '/dashboard' },
        { title: 'SMS Messages' },
    ];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete({ title: 'Are you sure you want to delete this message?' });
        if (confirmed) {
            try {
                await deleteMessage(id).unwrap();
                toast.success('Message deleted successfully');
                if (selectedId === id) {
                    closeSidebar();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete message');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Messages',
            text: `Are you sure you want to delete ${selectedRecords.length} selected messages?`,
        });

        if (confirmed) {
            try {
                const ids = selectedRecords.map((record) => record._id);
                const result = await bulkDeleteMessages(ids).unwrap();
                toast.success(`${result.deletedCount} messages deleted successfully`);
                if (selectedId && ids.includes(selectedId)) {
                    closeSidebar();
                }
                setSelectedRecords([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete messages');
            }
        }
    };

    const handleCreate = () => {
        setMessageToEdit(null);
        setIsOpen(true);
    };

    const handleEdit = (message: ISmsMessage) => {
        setMessageToEdit(message);
        setIsOpen(true);
        closeSidebar();
    };

    const handleViewDetail = (message: ISmsMessage) => {
        openSidebar(message._id);
    };

    const handleReschedule = (message: ISmsMessage) => {
        setMessageToReschedule(message);
        setIsRescheduleOpen(true);
    };

    const columns: ColumnConfig<ISmsMessage>[] = [
        {
            accessor: 'content',
            title: 'Message',
            type: 'text',
            sortable: true,
            render: ({ content }) => <span className="truncate block max-w-xs" title={content}>{content}</span>
        },
        {
            accessor: 'campaign',
            title: 'Campaign',
            type: 'text',
            sortable: true,
            render: ({ campaign }) => typeof campaign === 'object' ? campaign?.name : campaign
        },
        {
            accessor: 'messageType',
            title: 'Type',
            type: 'text',
            sortable: true,
            render: ({ messageType }) => <span className="capitalize">{messageType}</span>
        },
        {
            accessor: 'recipientCount',
            title: 'Recipients',
            type: 'number',
            sortable: true,
            render: ({ recipientCount }) => recipientCount || 0
        },
        {
            accessor: 'status',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'sent', label: 'Sent', color: 'success' },
                { value: 'failed', label: 'Failed', color: 'danger' },
                { value: 'pending', label: 'Pending', color: 'warning' },
                { value: 'scheduled', label: 'Scheduled', color: 'info' },
            ],
        },
        {
            accessor: 'scheduledAt',
            title: 'Scheduled',
            type: 'date',
            sortable: true,
            render: ({ scheduledAt }) => scheduledAt ? moment(scheduledAt).format('MMM D, h:mm A') : '-'
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
                    onClick: (record) => handleViewDetail(record),
                },
                {
                    type: 'edit',
                    onClick: (record) => handleEdit(record),
                },
                {
                    type: 'delete',
                    onClick: (record) => handleDelete(record._id),
                },
                {
                    type: 'reschedule',
                    onClick: (record) => handleReschedule(record),
                }
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />

            <DataTableWithSidebar<ISmsMessage>
                title="SMS Messages"
                columns={columns}
                fetchData={useGetAllSmsMessagesQuery}
                searchFields={['content']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                populate={[{ path: 'campaign' }]}
                rowSelectionEnabled={true}
                onSelectionChange={setSelectedRecords}
                bulkActions={[
                    {
                        label: 'Delete Selected',
                        icon: <IconTrash size={18} />,
                        color: 'red',
                        onClick: handleBulkDelete,
                    },
                ]}
                buttons={
                    <button type="button" className="btn btn-primary gap-2" onClick={handleCreate}>
                        <Plus size={16} />
                        Add New
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="SMS Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={
                    selectedMessage && (
                        <SmsMessageDetail
                            message={selectedMessage}
                            onEdit={handleEdit}
                        />
                    )
                }
                onRowClick={handleViewDetail}
                idAccessor="_id"
            />

            <SmsMessageForm
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                messageToEdit={messageToEdit}
            />

            <RescheduleModal
                isOpen={isRescheduleOpen}
                setIsOpen={setIsRescheduleOpen}
                message={messageToReschedule}
            />
        </div>
    );
};

export default SmsMessages;
