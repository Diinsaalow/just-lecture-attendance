import moment from 'moment';
import { useState } from 'react';
import { IconTrash } from '@tabler/icons-react'; // Added IconTrash import
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar'; // Changed to DataTableWithSidebar
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useDeleteCampaignMutation, useGetAllCampaignsQuery, useBulkDeleteCampaignsMutation } from '../../store/api/campaignApi'; // Added useBulkDeleteCampaignsMutation
import { ICampaign } from '../../types/campaign';
import { ColumnConfig } from '../../types/columns';
import CampaignModal from './components/CampaignModal';
import CampaignDetail from './components/CampaignDetail';

const CampaignList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<ICampaign | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ICampaign[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteCampaign] = useDeleteCampaignMutation();
    const [bulkDeleteCampaigns] = useBulkDeleteCampaignsMutation();

    const { selectedId: selectedCampaignId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const breadcrumbItems = [{ title: 'Dashboard', path: '/' }, { title: 'Campaigns' }];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteCampaign(id).unwrap();
                toast.success('Campaign deleted successfully');
                if (selectedCampaignId === id) {
                    closeSidebar();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete campaign');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Campaigns',
            text: `Are you sure you want to delete ${selectedRecords.length} selected campaigns?`,
        });

        if (confirmed) {
            try {
                const ids = selectedRecords.map((record) => record._id);
                const result = await bulkDeleteCampaigns(ids).unwrap();
                toast.success(`${result.deletedCount} campaigns deleted successfully`);
                if (selectedCampaignId) {
                    closeSidebar();
                }
                setSelectedRecords([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete campaigns');
            }
        }
    };

    const openCreateModal = () => {
        setCampaignToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (campaign: ICampaign) => {
        setCampaignToEdit(campaign);
        setIsOpen(true);
    };

    const handleViewCampaign = (campaign: ICampaign) => {
        openSidebar(campaign._id);
    };

    const columns: ColumnConfig<ICampaign>[] = [
        {
            accessor: 'name',
            title: 'Name',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'targetAudienceSize',
            title: 'Audience Size',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'startDate',
            title: 'Start Date',
            type: 'date',
            sortable: true,
            render: ({ startDate }) => <div>{startDate ? moment(startDate).format('MM/DD/YYYY') : '-'}</div>,
        },
        {
            accessor: 'endDate',
            title: 'End Date',
            type: 'date',
            sortable: true,
            render: ({ endDate }) => <div>{endDate ? moment(endDate).format('MM/DD/YYYY') : '-'}</div>,
        },
        {
            accessor: 'status',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'inactive', label: 'Inactive', color: 'danger' },
                { value: 'paused', label: 'Paused', color: 'warning' },
                { value: 'completed', label: 'Completed', color: 'info' },
            ],
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
                    onClick: (record) => handleViewCampaign(record),
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

            <DataTableWithSidebar<ICampaign>
                title="Campaign Table"
                columns={columns}
                fetchData={useGetAllCampaignsQuery}
                searchFields={['name', 'status']}
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
                sidebarTitle="Campaign Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<CampaignDetail campaignId={selectedCampaignId} />}
                idAccessor="_id"
            />

            <CampaignModal isOpen={isOpen} setIsOpen={setIsOpen} campaignToEdit={campaignToEdit} />
        </div>
    );
};

export default CampaignList;
