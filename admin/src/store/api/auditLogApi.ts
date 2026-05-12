import { BaseApi } from './baseApi';
import type { IAuditLog } from '../../types/auditLog';

class AuditLogApi extends BaseApi<IAuditLog> {
    constructor() {
        super('/audit-logs', {
            reducerPath: 'auditLogApi',
            tagType: 'auditLogs',
        });
    }
}

export const auditLogApi = new AuditLogApi().createApi();

export const {
    useGetAllQuery: useGetAllAuditLogsQuery,
} = auditLogApi;
