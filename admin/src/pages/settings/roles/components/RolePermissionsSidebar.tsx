import React, { useEffect, useState, useRef, useMemo } from 'react';
import GenericSidebar from '../../../../components/GenericSidebar';
import { IRole, AvailablePermission, FlattenedPermission, IAbilityRule } from '../../../../types';
import ActionButton from '../../../../components/ActionButton';
import { RolePermissionsSkeleton } from '../../../../components/skeleton';
import { toast } from 'sonner';
import { useGetAvailablePermissionsQuery, useUpdateRolePermissionsMutation } from '../../../../store/api/roleApi';

interface RolePermissionsSidebarProps {
    onClose: () => void;
    role: IRole | null;
}

// Remove the ACTIONS mapping - use backend actions directly

type IPermission = FlattenedPermission;

function groupPermissions(permissions: IPermission[]) {
    const groups: Record<string, Record<string, IPermission>> = {};
    permissions.forEach((perm) => {
        const action = String(perm.action);
        const subject = String(perm.subject);
        const conditionKey = perm.condition?.own ? '(own)' : '';
        const actionKey = `${action} ${conditionKey}`.trim();

        if (!groups[subject]) groups[subject] = {};
        groups[subject][actionKey] = perm;
    });
    return groups;
}

const RolePermissionsSidebar: React.FC<RolePermissionsSidebarProps> = ({ onClose, role }) => {
    const { data: available, isLoading, isError, refetch } = useGetAvailablePermissionsQuery();
    const [updateRolePermissions, { isLoading: isUpdating }] = useUpdateRolePermissionsMutation();
    const [allPermissions, setAllPermissions] = useState<IPermission[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [success, setSuccess] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Check if role has "manage all" permission
    const hasManageAll = useMemo(() => {
        if (!role || !Array.isArray(role.ability)) return false;
        return (role.ability as IAbilityRule[]).some((rule) => rule.action === 'manage' && rule.subject === 'all');
    }, [role]);

    // flatten API available permissions to checkbox items
    useEffect(() => {
        if (!available) return;
        const flattened: IPermission[] = [];
        (available as AvailablePermission[]).forEach((perm) => {
            const actions = Array.isArray(perm.action) ? perm.action : [perm.action];
            actions.forEach((action) => {
                // Create unique ID based on action, subject, and condition
                const conditionKey = perm.condition?.own ? '(own)' : '';
                const id = `${action} ${conditionKey} ${perm.subject}`.trim();
                const displayName = `${action} ${conditionKey} ${perm.subject}`.trim();

                flattened.push({
                    id,
                    name: displayName,
                    action: action as IPermission['action'],
                    subject: perm.subject,
                    condition: perm.condition,
                });
            });
        });
        setAllPermissions(flattened);
    }, [available]);

    // preselect based on role.ability rules
    useEffect(() => {
        if (!role || !Array.isArray(role.ability)) return;
        const selectedIds = new Set<string>();
        (role.ability as IAbilityRule[]).forEach((rule) => {
            // Check for "manage all" permission
            if (rule.action === 'manage' && rule.subject === 'all') {
                // Select all available permissions
                allPermissions.forEach((perm) => {
                    selectedIds.add(perm.id);
                });
            } else {
                const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
                actions.forEach((action) => {
                    // Create the same ID format as in the flattening logic
                    const conditionKey = rule.condition?.own ? '(own)' : '';
                    const id = `${action} ${conditionKey} ${rule.subject}`.trim();
                    selectedIds.add(id);
                });
            }
        });
        setSelected(selectedIds);
    }, [role, allPermissions]);

    const handleChange = (permId: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(permId)) {
                // If unchecking, just remove it
                next.delete(permId);
            } else {
                // If checking, find the permission being added
                const perm = allPermissions.find((p) => p.id === permId);
                if (perm && perm.action === 'read') {
                    // For read permissions, remove any existing read permissions for the same subject
                    const otherReadPerms = allPermissions.filter((p) => p.subject === perm.subject && p.action === 'read' && p.id !== permId);
                    otherReadPerms.forEach((otherPerm) => next.delete(otherPerm.id));
                }

                next.add(permId);
            }

            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        try {
            // Map selected IDs to permission rules grouped by subject and condition
            const selectedPerms = allPermissions.filter((perm) => selected.has(perm.id));
            const groupedBySubject: Record<string, Array<{ action: string; condition?: any }>> = {};
            selectedPerms.forEach((p) => {
                if (!groupedBySubject[p.subject]) groupedBySubject[p.subject] = [];
                groupedBySubject[p.subject].push({
                    action: p.action,
                    condition: p.condition,
                });
            });

            // build ability payload - group by subject and condition
            const abilityPayload: Array<{ subject: string; action: string | string[]; condition?: any }> = [];
            Object.entries(groupedBySubject).forEach(([subject, actions]) => {
                // Group actions by condition
                const globalActions = actions.filter((a) => !a.condition).map((a) => a.action);
                const ownActions = actions.filter((a) => a.condition?.own).map((a) => a.action);

                // Add global permissions
                if (globalActions.length > 0) {
                    abilityPayload.push({
                        subject,
                        action: globalActions.length === 1 ? globalActions[0] : globalActions,
                    });
                }

                // Add own permissions
                if (ownActions.length > 0) {
                    abilityPayload.push({
                        subject,
                        action: ownActions.length === 1 ? ownActions[0] : ownActions,
                        condition: { own: true },
                    });
                }
            });

            await updateRolePermissions({
                id: role._id || role.id || '',
                ability: abilityPayload,
            }).unwrap();

            toast.success('Role permissions updated successfully');
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            console.error('Error updating role permissions:', error);

            // Extract error message from different possible error structures
            let errorMessage = 'Failed to update role permissions';

            if (error?.data) {
                // Handle structured error response
                if (typeof error.data === 'string') {
                    errorMessage = error.data;
                } else if (error.data.message) {
                    // Handle single message
                    if (Array.isArray(error.data.message)) {
                        errorMessage = error.data.message.join(', ');
                    } else {
                        errorMessage = error.data.message;
                    }
                } else if (error.data.error) {
                    errorMessage = error.data.error;
                } else if (error.data.details) {
                    errorMessage = error.data.details;
                }
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            toast.error(errorMessage);
        }
    };

    // Render content based on state
    const renderContent = () => {
        if (isLoading) {
            return <RolePermissionsSkeleton />;
        }

        if (isError) {
            return (
                <div className="p-4">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-700 dark:text-red-300">Failed to load permissions</span>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            There was an error loading the available permissions. Please try again or contact support if the problem persists.
                        </p>
                        <ActionButton type="button" variant="outline-danger" onClick={() => refetch()} isLoading={isLoading} loadingText="Retrying..." displayText="Retry" />
                    </div>
                </div>
            );
        }

        const grouped = groupPermissions(allPermissions);

        return (
            <form ref={formRef} id="role-permissions-form" onSubmit={handleSubmit} className="flex flex-col">
                {/* Section Title */}
                <div className="font-semibold text-lg mb-2 mt-2">Permissions</div>
                {hasManageAll && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">This role has "Manage All" permission - all permissions are granted</span>
                        </div>
                    </div>
                )}
                {/* Grouped Permissions List - Compact, no card/box */}
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {Object.entries(grouped).map(([subject, actions]) => {
                        const hasReadGlobal = actions['read'] && selected.has(actions['read'].id);
                        const hasReadOwn = actions['read (own)'] && selected.has(actions['read (own)'].id);
                        const hasReadPermissions = hasReadGlobal || hasReadOwn;

                        return (
                            <div key={subject} className="py-3 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="font-medium text-gray-900 dark:text-white mb-2">{subject.charAt(0).toUpperCase() + subject.slice(1)}</div>
                                <div className="flex flex-wrap gap-4 ml-4">
                                    {Object.entries(actions).map(([actionKey, perm]) => {
                                        const isOwnPermission = actionKey.includes('(own)');
                                        const actionName = actionKey.replace('(own)', '').trim();
                                        const isReadPermission = actionName === 'read';
                                        const isDisabled = isUpdating || hasManageAll || (isReadPermission && hasReadPermissions && !selected.has(perm.id));

                                        return (
                                            <label
                                                key={actionKey}
                                                className={`flex items-center gap-1 text-gray-700 dark:text-gray-200 font-normal cursor-pointer select-none ${
                                                    isDisabled && !selected.has(perm.id) ? 'opacity-50' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(perm.id)}
                                                    onChange={() => handleChange(perm.id)}
                                                    disabled={isDisabled}
                                                    className="form-checkbox h-4 w-4 text-primary accent-primary focus:ring-primary"
                                                />
                                                <span className="text-sm">
                                                    {actionName.charAt(0).toUpperCase() + actionName.slice(1)}
                                                    {isOwnPermission && <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(own)</span>}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </form>
        );
    };

    // Render footer actions based on state
    const renderFooterActions = () => {
        if (isLoading) {
            return null; // Skeleton handles its own footer
        }

        if (isError) {
            return null; // Error state doesn't need footer actions
        }

        return (
            <>
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isUpdating} />
                <ActionButton
                    type="button"
                    variant="primary"
                    isLoading={isUpdating}
                    loadingText="Updating..."
                    displayText="Update"
                    disabled={isUpdating || hasManageAll}
                    onClick={() => formRef.current?.requestSubmit()}
                />
            </>
        );
    };

    return (
        <GenericSidebar
            isOpen={true}
            setIsOpen={(open) => {
                if (!open) onClose();
            }}
            title="Role Permissions"
            width={isError ? '600px' : '700px'}
            closeButtonPosition="both"
            footerActions={renderFooterActions()}
        >
            {renderContent()}
        </GenericSidebar>
    );
};

export default RolePermissionsSidebar;
