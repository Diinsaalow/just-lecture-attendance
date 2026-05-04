import moment from 'moment';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { IconTrash } from '@tabler/icons-react'; // Added IconTrash import
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar'; // Changed to DataTableWithSidebar
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useDeleteLocationMutation, useGetAllLocationsQuery, useBulkDeleteLocationsMutation } from '../../store/api/locationApi'; // Added useBulkDeleteLocationsMutation
import { ILocation } from '../../types/location';
import { ColumnConfig } from '../../types/columns';
import LocationModal from './components/LocationModal';
import LocationDetail from './components/LocationDetail';

const LocationList = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [locationToEdit, setLocationToEdit] = useState<ILocation | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<ILocation[]>([]);

    const { confirmDelete } = useConfirmDialog();
    const [deleteLocation] = useDeleteLocationMutation();
    const [bulkDeleteLocations] = useBulkDeleteLocationsMutation();

    const { selectedId: selectedLocationId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const breadcrumbItems = [{ title: 'Dashboard', path: '/' }, { title: 'Locations' }];

    const handleDelete = async (id: string) => {
        const confirmed = await confirmDelete();
        if (confirmed) {
            try {
                await deleteLocation(id).unwrap();
                toast.success('Location deleted successfully');
                if (selectedLocationId === id) {
                    closeSidebar();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete location');
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select items to delete');
            return;
        }

        const confirmed = await confirmDelete({
            title: 'Delete Multiple Locations',
            text: `Are you sure you want to delete ${selectedRecords.length} selected locations?`,
        });

        if (confirmed) {
            try {
                const ids = selectedRecords.map((record) => record._id);
                const result = await bulkDeleteLocations(ids).unwrap();
                toast.success(`${result.deletedCount} locations deleted successfully`);
                if (selectedLocationId) {
                    closeSidebar();
                }
                setSelectedRecords([]);
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete locations');
            }
        }
    };

    const openCreateModal = () => {
        setLocationToEdit(null);
        setIsOpen(true);
    };

    const openEditModal = (location: ILocation) => {
        setLocationToEdit(location);
        setIsOpen(true);
    };

    const handleViewLocation = (location: ILocation) => {
        openSidebar(location._id);
    };

    const columns: ColumnConfig<ILocation>[] = [
        {
            accessor: 'country',
            title: 'Country',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'region',
            title: 'Region',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'district',
            title: 'District',
            type: 'text',
            sortable: true,
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
                    onClick: (record) => handleViewLocation(record),
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

            <DataTableWithSidebar<ILocation>
                title="Location Table"
                columns={columns}
                fetchData={useGetAllLocationsQuery}
                searchFields={['country', 'region', 'district']}
                sortCol="createdAt"
                className="mt-5"
                query={{}} // Ensure query is passed as object
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
                idAccessor='_id'
                buttons={
                    <button type="button" className="btn btn-primary gap-2" onClick={openCreateModal}>
                        <Plus size={16} />
                        Add New
                    </button>
                }
                showSidebar={showSidebar}
                sidebarTitle="Location Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<LocationDetail locationId={selectedLocationId} />}
            />

            <LocationModal isOpen={isOpen} setIsOpen={setIsOpen} locationToEdit={locationToEdit} />
        </div>
    );
};

export default LocationList;
