import React, { useState } from 'react';
import moment from 'moment';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { 
    useGetAllDevicesQuery, 
    useApproveDeviceMutation, 
    useRejectDeviceMutation, 
    useClearDeviceMutation 
} from '../../store/api/deviceApi';
import { IUser } from '../../types/auth';
import { ColumnConfig } from '../../types/columns';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { Check, X, Trash2, Smartphone, Eye } from 'lucide-react';
import DeviceDetail from './components/DeviceDetail';

const DevicePage = () => {
    const [selectedRecords, setSelectedRecords] = useState<IUser[]>([]);
    const { selectedId: selectedUserId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();

    const [approveDevice] = useApproveDeviceMutation();
    const [rejectDevice] = useRejectDeviceMutation();
    const [clearDevice] = useClearDeviceMutation();

    const handleApprove = async (userId: string) => {
        try {
            await approveDevice(userId).unwrap();
            toast.success('Device approved successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to approve device');
        }
    };

    const handleReject = async (userId: string) => {
        try {
            await rejectDevice(userId).unwrap();
            toast.success('Device registration rejected');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to reject device');
        }
    };

    const handleClear = async (userId: string) => {
        try {
            await clearDevice(userId).unwrap();
            toast.success('Device cleared successfully');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to clear device');
        }
    };

    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Device Management', path: '/devices' }
    ];

    const columns: ColumnConfig<IUser>[] = [
        {
            accessor: 'firstName',
            title: 'User',
            type: 'text',
            sortable: true,
            render: ({ firstName, lastName, email }) => (
                <div>
                    <div className="font-medium">{firstName} {lastName}</div>
                    <div className="text-xs text-gray-500">{email}</div>
                </div>
            ),
        },
        {
            accessor: 'deviceModel',
            title: 'Device Info',
            type: 'text',
            render: ({ deviceModel, devicePlatform }) => (
                <div>
                    <div className="flex items-center gap-1">
                        <Smartphone size={14} className="text-gray-400" />
                        <span>{deviceModel || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">{devicePlatform || 'N/A'}</div>
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Registration Status',
            type: 'custom',
            render: ({ registeredDeviceId, pendingDeviceId }) => (
                <div className="flex items-center">
                    {registeredDeviceId ? (
                        <span className="badge badge-outline-success">Active</span>
                    ) : pendingDeviceId ? (
                        <span className="badge badge-outline-warning">Pending Approval</span>
                    ) : (
                        <span className="badge badge-outline-danger">Not Registered</span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'updatedAt',
            title: 'Last Activity',
            type: 'date',
            sortable: true,
            render: ({ updatedAt }) => <div>{updatedAt ? moment(updatedAt).fromNow() : '-'}</div>,
        },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            actions: [
                {
                    type: 'view',
                    onClick: (record) => openSidebar(record._id),
                },
                {
                    type: 'custom',
                    icon: <Check size={18} />,
                    tooltip: 'Approve Registration',
                    className: 'text-success',
                    show: (record) => !!record.pendingDeviceId,
                    onClick: (record) => handleApprove(record._id),
                },
                {
                    type: 'custom',
                    icon: <X size={18} />,
                    tooltip: 'Reject Registration',
                    className: 'text-danger',
                    show: (record) => !!record.pendingDeviceId,
                    onClick: (record) => handleReject(record._id),
                },
                {
                    type: 'delete',
                    tooltip: 'Clear Device (Reset)',
                    show: (record) => !!record.registeredDeviceId,
                    onClick: (record) => handleClear(record._id),
                },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />

            <DataTableWithSidebar<IUser>
                title="Device Registrations"
                columns={columns}
                fetchData={useGetAllDevicesQuery}
                searchFields={['firstName', 'lastName', 'email', 'deviceModel']}
                sortCol="updatedAt"
                rowSelectionEnabled={true}
                onSelectionChange={setSelectedRecords}
                searchable={true}
                className="mt-5"
                showSidebar={showSidebar}
                sidebarTitle="Device Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<DeviceDetail userId={selectedUserId} />}
                getRecordId={(record) => parseInt(record._id.replace(/\D/g, '').slice(-8) || '0', 10) || 0}
                idAccessor="_id"
            />
        </div>
    );
};

export default DevicePage;
