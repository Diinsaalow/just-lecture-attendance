import React from 'react';
import moment from 'moment';
import type { IAuditLog } from '../../../types/auditLog';

function actorLabel(actor: IAuditLog['actorId']): string {
    if (!actor) return 'system';
    if (typeof actor === 'string') return actor;
    const a = actor as {
        firstName?: string;
        lastName?: string;
        username?: string;
        email?: string;
    };
    const full = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim();
    return full || a.username || a.email || '-';
}

function JsonBlock({ value, title }: { value: unknown; title: string }) {
    if (value === undefined || value === null) return null;
    return (
        <div>
            <p className="font-semibold">{title}</p>
            <pre className="bg-gray-50 dark:bg-[#0f1726] text-xs rounded p-2 overflow-x-auto max-h-56 mt-1">
                {JSON.stringify(value, null, 2)}
            </pre>
        </div>
    );
}

interface Props {
    log: IAuditLog | null;
}

const AuditLogDetail: React.FC<Props> = ({ log }) => {
    if (!log) return <p className="text-gray-500">Select a log row.</p>;
    return (
        <div className="space-y-3 text-sm">
            <p className="text-gray-500">
                {moment(log.createdAt).format('MMM DD, YYYY HH:mm:ss')}
            </p>

            <div>
                <p className="font-semibold">Actor</p>
                <p>
                    {actorLabel(log.actorId)}
                    {log.actorRole ? <span className="text-gray-500"> · {log.actorRole}</span> : null}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="font-semibold">Action</p>
                    <p>{log.action}</p>
                </div>
                <div>
                    <p className="font-semibold">Entity</p>
                    <p>{log.entityType}</p>
                </div>
            </div>

            {log.entityId && (
                <div>
                    <p className="font-semibold">Entity ID</p>
                    <p className="font-mono text-xs break-all">{log.entityId}</p>
                </div>
            )}

            {log.facultyId && (
                <div>
                    <p className="font-semibold">Faculty</p>
                    <p className="font-mono text-xs break-all">{log.facultyId}</p>
                </div>
            )}

            <JsonBlock title="Before" value={log.before} />
            <JsonBlock title="After" value={log.after} />
            <JsonBlock title="Metadata" value={log.metadata} />
        </div>
    );
};

export default AuditLogDetail;
