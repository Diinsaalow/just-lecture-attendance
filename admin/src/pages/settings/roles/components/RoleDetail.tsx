import React from 'react';
import moment from 'moment';
import { IRole, IAbilityRule } from '../../../../types';
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

    const abilities = Array.isArray(role.ability) ? (role.ability as IAbilityRule[]) : [];

    return (
        <div className="p-6 space-y-6">
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
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Protected</label>
                        <p className="text-sm text-gray-900 dark:text-white">{role.isDeletable === false ? 'Yes (system role)' : 'No'}</p>
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

            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    CASL abilities {abilities.length ? `(${abilities.length})` : ''}
                </h3>
                {abilities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No abilities configured — defaults may apply from role templates on the server.</p>
                ) : (
                    <ul className="space-y-2 max-h-64 overflow-y-auto text-sm border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        {abilities.map((rule, idx) => {
                            const actions = Array.isArray(rule.action) ? rule.action.join(', ') : String(rule.action);
                            return (
                                <li key={`${rule.subject}-${idx}`} className="font-mono text-xs text-gray-800 dark:text-gray-200">
                                    <span className="text-primary">{actions}</span> → <span>{rule.subject}</span>
                                    {rule.condition && Object.keys(rule.condition).length > 0 ? (
                                        <span className="text-gray-500 ml-1">{JSON.stringify(rule.condition)}</span>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default RoleDetail;
