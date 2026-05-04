import React, { useState } from 'react';
import moment from 'moment';
import { MessageSquare, CheckCircle2, XCircle, Clock, TrendingUp, Download } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTable from '../../components/datatable';
import StatCard from '../../components/dashboard/StatCard';
import ActionButton from '../../components/ActionButton';
import { useGetSmsReportQuery, useLazyGetSmsReportQuery } from '../../store/api/reportApi';
import { ColumnConfig } from '../../types/columns';
import { SmsReportItem, SmsReportFilter } from '../../types/reports';

const SmsReport = () => {
    const [filters, setFilters] = useState<SmsReportFilter>({ page: 1, limit: 10 });
    const breadcrumbItems = [
        { title: 'Dashboard', path: '/' },
        { title: 'Reports', path: '/reports' },
        { title: 'SMS Delivery Report' }
    ];

    const { data, isLoading } = useGetSmsReportQuery(filters);
    const [triggerExportQuery] = useLazyGetSmsReportQuery();

    const handleExportCsv = async (filename: string) => {
        try {
            const exportFilters = { ...filters, page: 1, limit: 10000 };
            const { data: exportReport } = await triggerExportQuery(exportFilters);

            if (!exportReport?.docs || exportReport.docs.length === 0) {
                alert('No data to export');
                return;
            }

            const headers = ['Recipient Phone', 'Recipient Name', 'Message Content', 'Campaign', 'Status', 'Provider ID', 'Sent At', 'Delivered At', 'Failure Reason'];

            const csvRows = exportReport.docs.map((row: SmsReportItem) => [
                row.recipient?.phoneNumber || 'N/A',
                `${row.recipient?.firstName || ''} ${row.recipient?.lastName || ''}`.trim() || 'N/A',
                row.smsMessage?.content || 'N/A',
                row.smsMessage?.campaign?.name || 'N/A',
                row.deliveryStatus || 'N/A',
                row.gatewayMessageId || 'N/A',
                row.sentAt ? moment(row.sentAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
                row.deliveredAt ? moment(row.deliveredAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
                row.failureReason || ''
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

    const columns: ColumnConfig<SmsReportItem>[] = [
        {
            accessor: 'recipient.phoneNumber',
            title: 'Recipient',
            type: 'text',
            sortable: true,
            render: ({ recipient }) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{recipient?.phoneNumber}</span>
                    <span className="text-xs text-white-dark">
                        {recipient?.firstName} {recipient?.lastName}
                    </span>
                </div>
            )
        },
        {
            accessor: 'smsMessage.content',
            title: 'Message Content',
            type: 'text',
            sortable: false,
            render: ({ smsMessage }) => (
                <div
                    className="max-w-[200px] truncate cursor-help text-sm"
                    title={smsMessage?.content}
                >
                    {smsMessage?.content || '-'}
                </div>
            )
        },
        {
            accessor: 'smsMessage.campaign.name',
            title: 'Campaign',
            type: 'text',
            sortable: false,
            render: ({ smsMessage }) => (
                <div className="font-semibold text-primary">
                    {smsMessage?.campaign?.name || '-'}
                </div>
            )
        },
        {
            accessor: 'deliveryStatus',
            title: 'Status',
            type: 'status',
            sortable: true,
            options: [
                { value: 'delivered', label: 'Delivered', color: 'success' },
                { value: 'sent', label: 'Sent', color: 'info' },
                { value: 'pending', label: 'Pending', color: 'warning' },
                { value: 'failed', label: 'Failed', color: 'danger' },
            ],
        },
        {
            accessor: 'gatewayMessageId',
            title: 'Provider ID',
            type: 'text',
            sortable: false,
            render: ({ gatewayMessageId }) => (
                <code className="text-[10px] text-white-dark bg-gray-100 dark:bg-gray-800 px-1 rounded">
                    {gatewayMessageId || 'N/A'}
                </code>
            )
        },
        {
            accessor: 'sentAt',
            title: 'Timing',
            type: 'date',
            sortable: true,
            render: ({ sentAt, deliveredAt }) => (
                <div className="text-xs">
                    <div className="flex items-center gap-1 text-white-dark">
                        <Clock size={10} /> Sent: {sentAt ? moment(sentAt).format('HH:mm:ss') : '-'}
                    </div>
                    {deliveredAt && (
                        <div className="flex items-center gap-1 text-success">
                            <CheckCircle2 size={10} /> Del: {moment(deliveredAt).format('HH:mm:ss')}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessor: 'failureReason',
            title: 'Log/Notes',
            type: 'text',
            sortable: false,
            render: ({ failureReason }) => (
                <div className="text-xs text-danger truncate max-w-[120px]" title={failureReason}>
                    {failureReason || ''}
                </div>
            )
        },
    ];

    const fetchSmsReport = (params: any) => {
        const reportParams = {
            page: params.options?.page,
            limit: params.options?.limit,
            startDate: (params.query as any)?.startDate,
            endDate: (params.query as any)?.endDate,
            status: (params.query as any)?.status,
            campaigns: (params.query as any)?.campaigns,
        };
        // Update local filters for export sync
        if (JSON.stringify(filters) !== JSON.stringify(reportParams)) {
            setFilters(reportParams);
        }
        return useGetSmsReportQuery(reportParams);
    };

    return (
        <div className="space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Messages"
                    count={data?.summary?.totalMessages || 0}
                    previousCount={0}
                    icon={<MessageSquare size={24} />}
                    linkTo="/sms-messages"
                    gradientColors="bg-gradient-to-r from-primary to-primary/80"
                    badgeText="Volume"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Success Rate"
                    count={Math.round(data?.summary?.deliveryRate || 0)}
                    displayValue={`${Math.round(data?.summary?.deliveryRate || 0)}%`}
                    previousCount={0}
                    icon={<TrendingUp size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-success to-success/80"
                    badgeText="Performance"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Delivered"
                    count={data?.summary?.deliveredCount || 0}
                    previousCount={0}
                    icon={<CheckCircle2 size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-info to-info/80"
                    badgeText="Confirmed"
                    showGrowth={false}
                    isLoading={isLoading}
                />
                <StatCard
                    title="Failed"
                    count={data?.summary?.failedCount || 0}
                    previousCount={0}
                    icon={<XCircle size={24} />}
                    linkTo="#"
                    gradientColors="bg-gradient-to-r from-danger to-danger/80"
                    badgeText="Issues"
                    showGrowth={false}
                    isLoading={isLoading}
                />
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SMS Transmission</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed view of all message delivery statuses</p>
                </div>
                <ActionButton
                    type="button"
                    variant="primary"
                    displayText={
                        <span className="flex items-center gap-2">
                            <Download size={16} /> Export CSV
                        </span>
                    }
                    onClick={() => handleExportCsv('Sms_Delivery_Report')}
                />
            </div>

            <DataTable<SmsReportItem>
                title="SMS Transmission Logs"
                columns={columns}
                fetchData={fetchSmsReport}
                searchFields={['deliveryStatus', 'failureReason', 'recipient.phoneNumber', 'recipient.firstName', 'gatewayMessageId']}
                sortCol="createdAt"
                idAccessor="_id"
                exportable={{
                    enabled: true,
                    name: 'SMS_Delivery_Report_Current_Page',
                }}
            />
        </div>
    );
};

export default SmsReport;
