import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import ActionButton from '../../../../components/ActionButton';
import Alert from '../../../../components/Alert';
import FormInput from '../../../../components/form/FormInput';
import FormSwitch from '../../../../components/form/FormSwitch';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../../../../store/api/roleApi';
import { IRole } from '../../../../types';

// ---------------------- Schema & Types ----------------------
const roleSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    status: z.enum(['active', 'inactive', 'suspended']),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
    roleToEdit?: IRole | null;
    onClose: () => void;
}

// ---------------------- Main Component ----------------------
const RoleForm: React.FC<RoleFormProps> = ({ roleToEdit, onClose }) => {
    const [createRole, createRoleState] = useCreateRoleMutation();
    const [updateRole, updateRoleState] = useUpdateRoleMutation();
    const [generalError, setGeneralError] = useState<string | null>(null);

    const isEditMode = Boolean(roleToEdit);

    // Memoize default values to prevent unnecessary resets
    const defaultValues = useMemo(
        (): RoleFormData => ({
            name: roleToEdit?.name || '',
            status: roleToEdit?.status || 'active',
        }),
        [roleToEdit?.name, roleToEdit?.status]
    );

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues,
        mode: 'onChange',
    });

    // ---------------------- Mutations ----------------------
    const handleMutationError = (error: any) => {
        console.log('Error object received:', error);

        // Handle RTK Query error structure
        if (error?.data?.message && Array.isArray(error.data.message)) {
            const errorMessage = error.data.message.join(', ');
            setGeneralError(errorMessage);
        } else if (error?.data?.message) {
            setGeneralError(error.data.message);
        } else if (error?.message && Array.isArray(error.message)) {
            // Handle array of error messages
            const errorMessage = error.message.join(', ');
            setGeneralError(errorMessage);
        } else if (error?.errors) {
            Object.entries(error.errors).forEach(([key, value]) => {
                if (['name'].includes(key)) {
                    setError(key as any, {
                        type: 'server',
                        message: Array.isArray(value) ? value[0] : value,
                    });
                }
            });
        } else if (error?.message) {
            setGeneralError(error.message);
        } else {
            setGeneralError('An unexpected error occurred. Please try again.');
        }
    };

    const submitCreate = async (data: RoleFormData) => {
        try {
            await createRole(data as any).unwrap();
            toast.success('Role created successfully');
            handleClose();
        } catch (e: any) {
            handleMutationError(e);
        }
    };

    const submitUpdate = async (payload: { id: string; data: RoleFormData }) => {
        try {
            await updateRole(payload).unwrap();
            toast.success('Role updated successfully');
            handleClose();
        } catch (e: any) {
            handleMutationError(e);
        }
    };

    const isLoading = isSubmitting || createRoleState.isLoading || updateRoleState.isLoading;

    // ---------------------- Handlers ----------------------
    const onSubmit = (data: RoleFormData) => {
        if (isEditMode && roleToEdit) {
            submitUpdate({ id: roleToEdit._id, data });
        } else {
            submitCreate(data);
        }
    };

    const handleClose = () => {
        reset();
        setGeneralError(null);
        onClose();
    };

    useEffect(() => {
        // Only reset form when roleToEdit changes
        if (roleToEdit) {
            reset({
                name: roleToEdit.name,
                status: roleToEdit.status || 'active',
            });
        } else {
            // Reset to empty values when creating new role
            reset({
                name: '',
                status: 'active',
            });
        }
        setGeneralError(null);
        // Deliberately not including reset in dependencies to prevent form resets on focus changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleToEdit?.name, roleToEdit?.status, roleToEdit?._id]);

    // ---------------------- Render ----------------------
    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {generalError && <Alert type="danger" title="Error" message={generalError} />}

            <Controller
                name="name"
                control={control}
                render={({ field }) => <FormInput id="role_name" type="text" label="Role Name" error={errors.name?.message} placeholder="Enter role name" disabled={isLoading} {...field} />}
            />

            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <FormSwitch
                        id="role_status"
                        label="Status"
                        checked={field.value === 'active'}
                        onChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                        onBlur={field.onBlur}
                        disabled={isLoading}
                    />
                )}
            />

            {/* Actions */}
            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={handleClose} isLoading={false} displayText="Cancel" disabled={isLoading} />

                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    loadingText={isEditMode ? 'Updating...' : 'Saving...'}
                    displayText={isEditMode ? 'Update' : 'Save'}
                    className="ltr:ml-4 rtl:mr-4"
                />
            </div>
        </form>
    );
};

export default RoleForm;
