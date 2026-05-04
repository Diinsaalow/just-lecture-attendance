import React, { useState } from 'react';
import moment from 'moment';
import { Flag, AlertTriangle, ShieldAlert, MessageCircle, BarChart, Download } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/datatable';
import StatCard from '../../components/dashboard/StatCard';
import ActionButton from '../../components/ActionButton';
import { useGetFeedbackReportQuery, useLazyGetFeedbackReportQuery } from '../../store/api/reportApi';
import { ColumnConfig } from '../../types/columns';
import { FeedbackReportItem, FeedbackReportFilter } from '../../types/reports';

const FeedbackReport = () => {
    const [filters, setFilters] = useState<FeedbackReportFilter>({ page: 1, limit: 10 });
    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Reports', path: '/reports' },
        { title: 'Feedback & Risk Report' }
    ];

    const { data, isLoading } = useGetFeedbackReportQuery(filters);
    const [triggerExportQuery] = useLazyGetFeedbackReportQuery();

    const handleExportCsv = async (filename: string) => {
        try {
            const exportFilters = { ...filters, page: 1, limit: 10000 };
            const { data: exportReport } = await triggerExportQuery(exportFilters);

            if (!exportReport?.docs || exportReport.docs.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Phone', 'Campaign', 'Response', 'Risk Level', 'Received At'];

            const csvRows = exportReport.docs.map((row: FeedbackReportItem) => [
                row.phoneNumber || row.recipient?.phoneNumber || 'N/A',
                row.campaign?.name || 'N/A',
                row.responseText || '',
                row.riskLevel || 'N/A',
                moment(row.receivedAt).format('YYYY-MM-DD HH:mm:ss')
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

    const columns: ColumnConfig<FeedbackReportItem>[] = [
        {
            accessor: 'phoneNumber',
            title: 'Phone',
            type: 'text',
            sortable: true,
            render: ({ phoneNumber, recipient }) => (
                <div className="font-semibold text-primary">
                    {phoneNumber || recipient?.phoneNumber || '-'}
                </div>
            )
        },
        {
            accessor: 'campaign.name',
            title: 'Campaign',
            type: 'text',
            sortable: false,
            render: ({ campaign }) => (
                <div className="font-semibold text-primary">
                    {campaign?.name || '-'}
                </div>
            )
        },
        {
            accessor: 'responseText',
            title: 'Response',
            type: 'text',
            sortable: false,
            render: ({ responseText }) => (
                <div className="max-w-[300px] whitespace-normal italic text-sm">
                    "{responseText}"
                </div>
            )
        },
        {
            accessor: 'riskLevel',
            title: 'Risk Level',
            type: 'status',
            sortable: true,
            options: [
                { value: 'high', label: 'High Risk', color: 'danger' },
                { value: 'flagged', label: 'Medium Risk', color: 'warning' },
                { value: 'normal', label: 'Normal', color: 'success' },
            ],
        },
        {
            accessor: 'receivedAt',
            title: 'Received',
            type: 'date',
            sortable: true,
            render: ({ receivedAt }) => <div>{moment(receivedAt).fromNow()}</div>,
        },
    ];

    const fetchFeedbackReport = (params: any) => {
        const reportParams = {
            page: params.options?.page,
            limit: params.options?.limit,
            startDate: (params.query as any)?.startDate,
            endDate: (params.query as any)?.endDate,
            campaigns: (params.query as any)?.campaigns,
            riskLevels: (params.query as any)?.riskLevels,
        };
        if (JSON.stringify(filters) !== JSON.stringify(reportParams)) {
            setFilters(reportParams);
        }
        return useGetFeedbackReportQuery(reportParams);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Feedback"
                    count={data?.summary?.totalFeedback || 0}
                    previousCount={0}
                    icon={<MessageCircle size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-primary to-primary/80"
                    badgeText="Responses"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="High Risk"
                    count={data?.summary?.highRiskCount || 0}
                    previousCount={0}
                    icon={<ShieldAlert size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-danger to-danger/80"
                    badgeText="Urgent"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Medium Risk"
                    count={data?.summary?.mediumRiskCount || 0}
                    previousCount={0}
                    icon={<AlertTriangle size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-warning to-warning/80"
                    badgeText="Flagged"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Healthy/Normal"
                    count={data?.summary?.lowRiskCount || 0}
                    previousCount={0}
                    icon={<BarChart size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-success to-success/80"
                    badgeText="Safe"
                    showGrowth={false}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Sentiment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed view of all feedback & risk levels</p>
                </div>
                <ActionButton
                    type="button"
                    variant="primary"
                    displayText={
                        <span className="flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </span>
                    }
                    onClick={() => handleExportCsv('Feedback_Report')}
                />
            </div>

            <DataTable<FeedbackReportItem>
                title="User Sentiment Analysis"
                columns={columns}
                fetchData={fetchFeedbackReport}
                searchFields={['responseText', 'riskLevel', 'phoneNumber']}
                sortCol="receivedAt"
                idAccessor="_id"
                exportable={{
                    enabled: true,
                    name: 'Feedback_Risk_Report_Current_Page',
                }}
            />
        </div>
    );
};

export default FeedbackReport;
