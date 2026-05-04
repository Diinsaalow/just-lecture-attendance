import React, { useState } from 'react';
import moment from 'moment';
import { Users, MapPin, UserCheck, UserMinus, Globe, Download } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/datatable';
import StatCard from '../../components/dashboard/StatCard';
import ActionButton from '../../components/ActionButton';
import { useGetRecipientReportQuery, useLazyGetRecipientReportQuery } from '../../store/api/reportApi';
import { ColumnConfig } from '../../types/columns';
import { RecipientReportItem, RecipientReportFilter } from '../../types/reports';

const RecipientReport = () => {
    const [filters, setFilters] = useState<RecipientReportFilter>({ page: 1, limit: 10 });
    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Reports', path: '/reports' },
        { title: 'Recipient Demographics' }
    ];

    const { data, isLoading } = useGetRecipientReportQuery(filters);
    const [triggerExportQuery] = useLazyGetRecipientReportQuery();

    const handleExportCsv = async (filename: string) => {
        try {
            const exportFilters = { ...filters, page: 1, limit: 10000 };
            const { data: exportReport } = await triggerExportQuery(exportFilters);

            if (!exportReport?.docs || exportReport.docs.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Phone Number', 'District', 'Region', 'Gender', 'Language', 'Status', 'Registered At'];

            const csvRows = exportReport.docs.map((row: RecipientReportItem) => [
                row.phoneNumber || 'N/A',
                row.location?.district || 'N/A',
                row.location?.region || 'N/A',
                row.gender || 'Not Specified',
                (row as any).languageCode || 'so',
                row.isActive ? 'Active' : 'Opted Out',
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

    const columns: ColumnConfig<RecipientReportItem>[] = [
        {
            accessor: 'phoneNumber',
            title: 'Subscriber',
            type: 'text',
            sortable: true,
            render: ({ phoneNumber }) => (
                <div className="font-semibold text-primary">
                    {phoneNumber}
                </div>
            )
        },
        {
            accessor: 'location',
            title: 'Region/District',
            type: 'text',
            sortable: false,
            render: ({ location }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{location?.district || '-'}</span>
                    <span className="text-xs text-white-dark">{location?.region || 'Unknown Location'}</span>
                </div>
            )
        },
        {
            accessor: 'gender',
            title: 'Gender',
            type: 'text',
            sortable: true,
            render: ({ gender }) => (
                <div className="capitalize text-sm">
                    {gender || 'Not Specified'}
                </div>
            )
        },
        {
            accessor: 'languageCode',
            title: 'Language',
            type: 'text',
            sortable: true,
            render: ({ languageCode }) => (
                <div className="font-semibold text-primary uppercase">
                    {languageCode || 'so'}
                </div>
            )
        },
        {
            accessor: 'isActive',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'inactive', label: 'Opted Out', color: 'danger' },
            ],
            render: ({ isActive }) => (
                <span className={`badge ${isActive ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                    {isActive ? 'Active' : 'Opted Out'}
                </span>
            )
        },
        {
            accessor: 'createdAt',
            title: 'Registered On',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => (
                <div className="text-xs text-white-dark font-medium">
                    {moment(createdAt).format('MMM DD, YYYY')}
                </div>
            ),
        },
    ];

    const fetchRecipientReport = (params: any) => {
        const reportParams = {
            page: params.options?.page,
            limit: params.options?.limit,
            startDate: (params.query as any)?.startDate,
            endDate: (params.query as any)?.endDate,
            locations: (params.query as any)?.locations,
            genders: (params.query as any)?.genders,
            isActive: (params.query as any)?.isActive === 'true' ? true : (params.query as any)?.isActive === 'false' ? false : undefined,
        };
        if (JSON.stringify(filters) !== JSON.stringify(reportParams)) {
            setFilters(reportParams);
        }
        return useGetRecipientReportQuery(reportParams);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Recipients"
                    count={data?.summary?.totalRecipients || 0}
                    previousCount={0}
                    icon={<Users size={24} />}
                    linkTo="/recipients"
                    gradientColors="bg-gradient-to-r from-primary to-primary/80"
                    badgeText="Database"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Active"
                    count={data?.summary?.activeRecipients || 0}
                    previousCount={0}
                    icon={<UserCheck size={24} />}
                    linkTo="/recipients?isActive=true"
                    gradientColors="bg-gradient-to-r from-success to-success/80"
                    badgeText="Opt-in"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Opted Out"
                    count={data?.summary?.optedOutCount || 0}
                    previousCount={0}
                    icon={<UserMinus size={24} />}
                    linkTo="/recipients?isActive=false"
                    gradientColors="bg-gradient-to-r from-danger to-danger/80"
                    badgeText="Unsubscribed"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Regions Covered"
                    count={data?.summary?.byLocation?.length || 0}
                    previousCount={0}
                    icon={<Globe size={24} />}
                    linkTo="/locations"
                    gradientColors="bg-gradient-to-r from-info to-info/80"
                    badgeText="Geography"
                    showGrowth={false}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recipient Demographics</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed view of subscriber distribution</p>
                </div>
                <ActionButton
                    type="button"
                    variant="primary"
                    displayText={
                        <span className="flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </span>
                    }
                    onClick={() => handleExportCsv('Recipient_Demographic_Report')}
                />
            </div>

            <DataTable<RecipientReportItem>
                title="Recipient Demographic Distribution"
                columns={columns}
                fetchData={fetchRecipientReport}
                searchFields={['phoneNumber', 'gender']}
                sortCol="createdAt"
                idAccessor="_id"
                exportable={{
                    enabled: true,
                    name: 'Recipient_Demographic_Report_Current_Page',
                }}
            />
        </div>
    );
};

export default RecipientReport;
