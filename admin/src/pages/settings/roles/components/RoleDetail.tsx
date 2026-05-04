import React from 'react';
import moment from 'moment';
import { IRole } from '../../../../types';
import RoleDetailSkeleton from '../../../../components/skeleton/RoleDetailSkeleton';
import { useGetRoleByIdQuery } from '../../../../store/api/roleApi';

interface RoleDetailProps {
    roleId?: string | null;
}

const RoleDetail: React.FC<RoleDetailProps> = ({ roleId }) => {
    const { data: role, isLoading, error } = useGetRoleByIdQuery(roleId ? (roleId as unknown as string) : '', { skip: !roleId });

    if (!roleId) {
        return <div className="p-6 text-center text-gray-500">Select a role to view details</div>;
    }

    if (isLoading) {
        return <RoleDetailSkeleton />;
    }

    if (error || !role) {
        return <div className="p-6 text-center text-red-500">Failed to load role details</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Information</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-sm text-gray-900 dark:text-white">{role.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                        <p className="text-sm text-gray-900 dark:text-white">{role.status || '-'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</label>
                        <p className="text-sm text-gray-900 dark:text-white">{role.createdAt ? moment(role.createdAt).format('MMM DD, YYYY HH:mm') : '-'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</label>
                        <p className="text-sm text-gray-900 dark:text-white">{role.updatedAt ? moment(role.updatedAt).format('MMM DD, YYYY HH:mm') : '-'}</p>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            {Array.isArray((role as any).permissions) && (role as any).permissions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions {(role as any).permissions.length ? `(${(role as any).permissions.length})` : ''}</h3>
                </div>
            )}

            {(!(role as any).permissions || (role as any).permissions.length === 0) && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Permissions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No permissions assigned to this role.</p>
                </div>
            )}
        </div>
    );
};

export default RoleDetail;
