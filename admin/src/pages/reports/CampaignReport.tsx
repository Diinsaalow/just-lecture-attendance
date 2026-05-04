import React from 'react';
import moment from 'moment';
import { Megaphone, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/datatable';
import StatCard from '../../components/dashboard/StatCard';
import ActionButton from '../../components/ActionButton';
import { useGetCampaignReportQuery, useLazyGetCampaignReportQuery } from '../../store/api/reportApi';
import { ColumnConfig } from '../../types/columns';
import { CampaignReportItem } from '../../types/reports';

const CampaignReport = () => {
    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Reports', path: '/reports' },
        { title: 'Campaign Report' }
    ];

    // Using a manual query state to get summary data
    const [queryParams, setQueryParams] = React.useState({ page: 1, limit: 10 });
    const { data, isLoading } = useGetCampaignReportQuery(queryParams);
    const [triggerExportQuery] = useLazyGetCampaignReportQuery();

    const handleExportCsv = async (filename: string) => {
        try {
            const exportFilters = { ...queryParams, page: 1, limit: 10000 };
            const { data: exportReport } = await triggerExportQuery(exportFilters);

            if (!exportReport?.docs || exportReport.docs.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Campaign Name', 'Start Date', 'End Date', 'Audience Size', 'Status', 'Created At'];

            const csvRows = exportReport.docs.map((row: CampaignReportItem) => [
                row.name || 'N/A',
                row.startDate ? moment(row.startDate).format('YYYY-MM-DD') : 'N/A',
                row.endDate ? moment(row.endDate).format('YYYY-MM-DD') : 'N/A',
                row.targetAudienceSize || 0,
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

    const columns: ColumnConfig<CampaignReportItem>[] = [
        {
            accessor: 'name',
            title: 'Campaign Name',
            type: 'text',
            sortable: true,
            render: ({ name }) => (
                <div className="font-semibold text-primary">
                    {name}
                </div>
            )
        },
        {
            accessor: 'startDate',
            title: 'Start Date',
            type: 'date',
            sortable: true,
            render: ({ startDate }) => <div>{startDate ? moment(startDate).format('MMM DD, YYYY') : '-'}</div>,
        },
        {
            accessor: 'endDate',
            title: 'End Date',
            type: 'date',
            sortable: true,
            render: ({ endDate }) => <div>{endDate ? moment(endDate).format('MMM DD, YYYY') : '-'}</div>,
        },
        {
            accessor: 'targetAudienceSize',
            title: 'Audience Size',
            type: 'number',
            sortable: true,
            textAlignment: 'center',
        },
        {
            accessor: 'status',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'active', label: 'Active', color: 'success' },
                { value: 'completed', label: 'Completed', color: 'info' },
                { value: 'paused', label: 'Paused', color: 'warning' },
                { value: 'inactive', label: 'Inactive', color: 'danger' },
            ],
        },
        {
            accessor: 'createdAt',
            title: 'Created At',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => <div>{moment(createdAt).format('MMM DD, YYYY')}</div>,
        },
    ];

    const fetchCampaignReport = (params: any) => {
        const reportParams = {
            page: params.options?.page,
            limit: params.options?.limit,
            startDate: (params.query as any)?.startDate,
            endDate: (params.query as any)?.endDate,
            status: (params.query as any)?.status,
        };
        if (JSON.stringify(queryParams) !== JSON.stringify(reportParams)) {
            setQueryParams(reportParams);
        }
        return useGetCampaignReportQuery(reportParams);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Campaigns"
                    count={data?.summary?.totalCampaigns || 0}
                    previousCount={0}
                    icon={<Megaphone size={24} />}
                    linkTo="/campaigns"
                    gradientColors="bg-gradient-to-r from-primary to-primary/80"
                    badgeText="All Time"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Active"
                    count={data?.summary?.activeCampaigns || 0}
                    previousCount={0}
                    icon={<Clock size={24} />}
                    linkTo="/campaigns?status=active"
                    gradientColors="bg-gradient-to-r from-success to-success/80"
                    badgeText="In Progress"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Completed"
                    count={data?.summary?.completedCampaigns || 0}
                    previousCount={0}
                    icon={<CheckCircle size={24} />}
                    linkTo="/campaigns?status=completed"
                    gradientColors="bg-gradient-to-r from-info to-info/80"
                    badgeText="Finished"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Draft/Inactive"
                    count={data?.summary?.draftCampaigns || 0}
                    previousCount={0}
                    icon={<AlertCircle size={24} />}
                    linkTo="/campaigns?status=inactive"
                    gradientColors="bg-gradient-to-r from-danger to-danger/80"
                    badgeText="Pending"
                    showGrowth={false}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Campaign Performance</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed view of all outreach campaigns</p>
                </div>
                <ActionButton
                    type="button"
                    variant="primary"
                    displayText={
                        <span className="flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </span>
                    }
                    onClick={() => handleExportCsv('Campaign_Report')}
                />
            </div>

            <DataTable<CampaignReportItem>
                title="Campaign Performance Data"
                columns={columns}
                fetchData={fetchCampaignReport}
                searchFields={['name', 'status']}
                sortCol="createdAt"
                idAccessor="_id"
                exportable={{
                    enabled: true,
                    name: 'Campaign_Report_Current_Page',
                }}
            />
        </div>
    );
};

export default CampaignReport;
