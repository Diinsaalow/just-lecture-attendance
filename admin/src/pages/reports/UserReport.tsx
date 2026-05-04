import React, { useState } from 'react';
import moment from 'moment';
import { UserCheck, ShieldCheck, ShieldAlert, UserX, Activity, Download } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/datatable';
import StatCard from '../../components/dashboard/StatCard';
import ActionButton from '../../components/ActionButton';
import { useGetUserReportQuery, useLazyGetUserReportQuery } from '../../store/api/reportApi';
import { ColumnConfig } from '../../types/columns';
import { UserReportItem, UserReportFilter } from '../../types/reports';

const UserReport = () => {
    const [filters, setFilters] = useState<UserReportFilter>({ page: 1, limit: 10 });
    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Reports', path: '/reports' },
        { title: 'User Account Activity' }
    ];

    const { data, isLoading } = useGetUserReportQuery(filters);
    const [triggerExportQuery] = useLazyGetUserReportQuery();

    const handleExportCsv = async (filename: string) => {
        try {
            const exportFilters = { ...filters, page: 1, limit: 10000 };
            const { data: exportReport } = await triggerExportQuery(exportFilters);

            if (!exportReport?.docs || exportReport.docs.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Name', 'Email', 'Role', 'Verified', 'Status', 'Created At'];

            const csvRows = exportReport.docs.map((row: UserReportItem) => [
                `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'N/A',
                row.email || 'N/A',
                row.role?.name || 'User',
                row.isVerified ? 'Yes' : 'No',
                row.status || 'N/A',
                moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
            ]);

            const csv = [
                headers.join(','),
                ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.csv`);
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data');
        }
    };

    const columns: ColumnConfig<UserReportItem>[] = [
        {
            accessor: 'firstName',
            title: 'Name',
            type: 'text',
            sortable: true,
            render: ({ firstName, lastName }) => <div>{firstName} {lastName}</div>
        },
        {
            accessor: 'email',
            title: 'Email',
            type: 'text',
            sortable: true,
        },
        {
            accessor: 'role.name',
            title: 'Role',
            type: 'text',
            sortable: false,
            render: ({ role }) => <div className="font-semibold text-primary">{role?.name || 'User'}</div>
        },
        {
            accessor: 'isVerified',
            title: 'Verified',
            type: 'status',
            sortable: true,
            options: [
                { value: 'true', label: 'Verified', color: 'success' },
                { value: 'false', label: 'Unverified', color: 'danger' },
            ],
            render: ({ isVerified }) => (
                <span className={`badge ${isVerified ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {isVerified ? 'Verified' : 'Unverified'}
                </span>
            )
        },
        {
            accessor: 'status',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'inactive', label: 'Inactive', color: 'danger' },
                { value: 'suspended', label: 'Suspended', color: 'warning' },
            ],
        },
    ];

    const fetchUserReport = (params: any) => {
        const reportParams = {
            page: params.options?.page,
            limit: params.options?.limit,
            startDate: (params.query as any)?.startDate,
            endDate: (params.query as any)?.endDate,
            role: (params.query as any)?.role,
            status: (params.query as any)?.status,
            isVerified: (params.query as any)?.isVerified,
        };
        if (JSON.stringify(filters) !== JSON.stringify(reportParams)) {
            setFilters(reportParams);
        }
        return useGetUserReportQuery(reportParams);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Active Users"
                    count={data?.summary?.activeUsers || 0}
                    previousCount={0}
                    icon={<Activity size={24} />}
                    linkTo="/users"
                    gradientColors="bg-gradient-to-r from-success to-success/80"
                    badgeText="Live"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Verified Accounts"
                    count={data?.summary?.verifiedUsers || 0}
                    previousCount={0}
                    icon={<ShieldCheck size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-primary to-primary/80"
                    badgeText="Trusted"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Unverified"
                    count={data?.summary?.unverifiedUsers || 0}
                    previousCount={0}
                    icon={<ShieldAlert size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-warning to-warning/80"
                    badgeText="Pending"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Inactive/Suspended"
                    count={(data?.summary?.inactiveUsers || 0) + (data?.summary?.suspendedUsers || 0)}
                    previousCount={0}
                    icon={<UserX size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-danger to-danger/80"
                    badgeText="Disabled"
                    showGrowth={false}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Accounts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed view of administrative users & activity</p>
                </div>
                <ActionButton
                    type="button"
                    variant="primary"
                    displayText={
                        <span className="flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </span>
                    }
                    onClick={() => handleExportCsv('User_Activity_Report')}
                />
            </div>

            <DataTable<UserReportItem>
                title="System User Status Report"
                columns={columns}
                fetchData={fetchUserReport}
                searchFields={['firstName', 'email', 'status']}
                sortCol="createdAt"
                idAccessor="_id"
                exportable={{
                    enabled: true,
                    name: 'User_Activity_Report_Current_Page',
                }}
            />
        </div>
    );
};

export default UserReport;
