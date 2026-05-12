import moment from 'moment';
import { useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import { useGetAllAuditLogsQuery } from '../../store/api/auditLogApi';
import type { ColumnConfig } from '../../types/columns';
import type { IAuditLog } from '../../types/auditLog';
import AuditLogDetail from './components/AuditLogDetail';

function actorLabel(actor: IAuditLog['actorId']): string {
    if (!actor) return 'system';
    if (typeof actor === 'string') return actor;
    const a = actor as { firstName?: string; lastName?: string; username?: string; email?: string };
    const full = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
    return full || a.username || a.email || '-';
}

const AuditLogsPage = () => {
    const { showSidebar, openSidebar, closeSidebar } = useSidebarDetail();
    const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);

    const columns: ColumnConfig<IAuditLog>[] = [
        {
            accessor: 'createdAt',
            title: 'When',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => (
                <span>{createdAt ? moment(createdAt).format('MMM DD, YYYY HH:mm:ss') : '-'}</span>
            ),
        },
        {
            accessor: 'actorId',
            title: 'Actor',
            type: 'text',
            sortable: false,
            render: (r) => (
                <span>
                    {actorLabel(r.actorId)}
                    {r.actorRole ? <span className="text-gray-500"> · {r.actorRole}</span> : null}
                </span>
            ),
        },
        { accessor: 'action', title: 'Action', type: 'text', sortable: true },
        { accessor: 'entityType', title: 'Entity', type: 'text', sortable: true },
        {
            accessor: 'entityId',
            title: 'Entity ID',
            type: 'text',
            sortable: false,
            render: (r) => (
                <span className="font-mono text-xs">{r.entityId ? r.entityId : '-'}</span>
            ),
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
                    onClick: (r) => {
                        setSelectedLog(r);
                        openSidebar(r._id);
                    },
                },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Audit Logs' }]} />
            <DataTableWithSidebar<IAuditLog>
                title="Audit Trail"
                columns={columns}
                fetchData={useGetAllAuditLogsQuery}
                searchFields={['action', 'entityType']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                idAccessor="_id"
                rowSelectionEnabled={false}
                showSidebar={showSidebar}
                sidebarTitle="Audit Log Details"
                onCloseSidebar={() => {
                    setSelectedLog(null);
                    closeSidebar();
                }}
                sidebarContent={<AuditLogDetail log={selectedLog} />}
            />
        </div>
    );
};

export default AuditLogsPage;
