import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import ActionButton from '../../../components/ActionButton';
import Alert from '../../../components/Alert';
import FormCombobox from '../../../components/form/FormCombobox';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { useCreateUserMutation, useUpdateUserMutation } from '../../../store/api/userApi';
import { useGetAllRolesQuery } from '../../../store/api/roleApi';
import { IUser, IRole } from '../../../types/auth';
import { useDebounce } from '../../../hooks/useDebounce';

// ---------------------- Schema & Types ----------------------
const userSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required').max(255),
        lastName: z.string().min(1, 'Last name is required').max(255),
        email: z.string().email('Invalid email format'),
        password: z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 8, {
                message: 'Password must be at least 8 characters',
            }),
        password_confirmation: z.string().optional(),
        phone: z.string().optional().nullable(),
        status: z.enum(['active', 'inactive', 'suspended']).optional(),
        role: z.union([z.string().regex(/^[0-9a-fA-F]{24}$/, 'Role must be a valid MongoDB ID'), z.literal(''), z.null()]).optional(),
    })
    .refine((data) => !data.password || data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
    userToEdit?: IUser | null;
    onClose: () => void;
}

// Use actual roles from API with compatible interface for FormCombobox
interface RoleOption {
    id: number; // FormCombobox requires this
    _id: string; // Actual MongoDB ID
    name: string;
}

// ---------------------- Main Component ----------------------
const UserForm: React.FC<UserFormProps> = ({ userToEdit, onClose }) => {
    const [roleQuery, setRoleQuery] = useState('');
    const [generalError, setGeneralError] = useState<string | null>(null);

    const isEditMode = Boolean(userToEdit);

    // Fetch roles from API with remote search using debounced query
    const debouncedRoleQuery = useDebounce(roleQuery, 300);
    const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery({
        search: { keyword: debouncedRoleQuery, fields: ['name', 'status'] },
        options: { limit: 10, page: 1, sort: { name: 'asc' } },
    });
    const roles: RoleOption[] = (rolesData?.docs || []).map((role: IRole, index: number) => ({
        id: index + 1, // FormCombobox requires numeric id
        _id: role._id,
        name: role.name,
    }));

    const {
        control,
        handleSubmit,
        reset,
        setError,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            password_confirmation: '',
            phone: '',
            status: 'active',
            role: '',
        },
        mode: 'onChange',
    });

    // ---------------------- Mutations ----------------------
    const [createUser] = useCreateUserMutation();
    const [updateUser] = useUpdateUserMutation();

    const handleMutationError = (error: any) => {
        // Handle specific MongoDB duplicate key errors
        if (error?.data?.code === 11000 || error?.code === 11000) {
            const keyValue = error?.data?.keyValue || error?.keyValue || {};
            if (keyValue.email) {
                setError('email', {
                    type: 'server',
                    message: 'This email address is already registered. Please use a different email.',
                });
                return;
            }
        }

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
                if (['firstName', 'lastName', 'email', 'password', 'password_confirmation', 'phone', 'role', 'status'].includes(key)) {
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

    const isLoading = isSubmitting;

    // ---------------------- Handlers ----------------------
    const generateStrongPassword = (length: number = 12) => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{};:,.<>?';
        const all = uppercase + lowercase + numbers + symbols;

        const getRandomInt = (max: number) => {
            if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                return array[0] % max;
            }
            return Math.floor(Math.random() * max);
        };

        const ensure = [uppercase[getRandomInt(uppercase.length)], lowercase[getRandomInt(lowercase.length)], numbers[getRandomInt(numbers.length)], symbols[getRandomInt(symbols.length)]];

        const remaining = Array.from({ length: Math.max(4, length) - ensure.length }, () => all[getRandomInt(all.length)]);
        const combined = [...ensure, ...remaining];
        for (let i = combined.length - 1; i > 0; i--) {
            const j = getRandomInt(i + 1);
            [combined[i], combined[j]] = [combined[j], combined[i]];
        }
        return combined.join('');
    };

    const generatePassword = () => {
        const pwd = generateStrongPassword(12);
        setValue('password', pwd, { shouldDirty: true, shouldValidate: true });
        setValue('password_confirmation', pwd, { shouldDirty: true, shouldValidate: true });
        toast.success('Generated a strong password');
    };

    const onSubmit = async (data: UserFormData) => {
        try {
            // Prepare payload - remove frontend-only fields
            const { password_confirmation, ...payloadData } = data;

            let formData = {
                ...payloadData,
            } as any;

            // Handle role field - convert empty string to null
            if (formData.role === '') {
                formData.role = null;
            }

            // Remove other empty-string fields
            Object.keys(formData).forEach((key) => {
                if (formData[key] === '' && key !== 'role') {
                    delete formData[key];
                }
            });

            // Remove empty password fields when updating
            if (isEditMode && userToEdit) {
                if (!data.password) {
                    const { password, ...restData } = formData;
                    await updateUser({ id: userToEdit._id, data: restData }).unwrap();
                } else {
                    await updateUser({ id: userToEdit._id, data: formData }).unwrap();
                }
                toast.success('User updated successfully');
            } else {
                // For create, ensure password is required
                if (!data.password) {
                    setError('password', {
                        type: 'manual',
                        message: 'Password is required',
                    });
                    return;
                }

                await createUser(formData).unwrap();
                toast.success('User created successfully');
            }

            handleClose();
        } catch (error: any) {
            handleMutationError(error);
        }
    };

    const handleClose = () => {
        reset();
        setGeneralError(null);
        setRoleQuery('');
        onClose();
    };

    useEffect(() => {
        if (userToEdit) {
            const formData: any = {
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                email: userToEdit.email || '',
                password: '',
                password_confirmation: '',
                phone: userToEdit.phone || '',
                status: userToEdit.status || 'active',
            };

            // Set role
            if (typeof userToEdit.role === 'object' && userToEdit.role?._id) {
                formData.role = userToEdit.role._id;
                if (userToEdit.role?.name) {
                    setRoleQuery(userToEdit.role.name);
                }
            } else if (typeof userToEdit.role === 'string' && userToEdit.role) {
                formData.role = userToEdit.role;
                // Find the role name to set in query
                const role = roles.find((r) => r._id === userToEdit.role);
                if (role) {
                    setRoleQuery(role.name);
                }
            } else {
                formData.role = '';
            }

            reset(formData);
        }
        setGeneralError(null);
    }, [userToEdit, reset]);

    const selectedRoleId = watch('role');
    const selectedRole = roles.find((r: RoleOption) => r._id === selectedRoleId) || null;

    // Handle search input for role
    const handleRoleSearch = (query: string) => {
        setRoleQuery(query);
    };

    // ---------------------- Render ----------------------
    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {generalError && <Alert type="danger" title="Error" message={generalError} />}

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <FormInput id="user_firstName" type="text" label="First Name" error={errors.firstName?.message} placeholder="Enter user's first name" disabled={isLoading} {...field} />
                        )}
                    />
                </div>
                <div className="w-full md:w-1/2">
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <FormInput id="user_lastName" type="text" label="Last Name" error={errors.lastName?.message} placeholder="Enter user's last name" disabled={isLoading} {...field} />
                        )}
                    />
                </div>
            </div>

            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="user_email"
                        type="email"
                        label="Email"
                        error={errors.email?.message}
                        placeholder="Enter email address"
                        disabled={isLoading}
                        {...field}
                        value={field.value || ''}
                    />
                )}
            />

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2">
                    <div className="space-y-2">
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    id="user_password"
                                    type="password"
                                    label={isEditMode ? 'Password (leave blank to keep current)' : 'Password'}
                                    error={errors.password?.message}
                                    placeholder={isEditMode ? 'Enter new password' : 'Enter password'}
                                    disabled={isLoading}
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                            )}
                        />
                        <button
                            type="button"
                            onClick={generatePassword}
                            disabled={isLoading}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                            🔐 Generate Secure Password
                        </button>
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                    <Controller
                        name="password_confirmation"
                        control={control}
                        render={({ field }) => (
                            <FormInput
                                id="user_password_confirmation"
                                type="password"
                                label="Confirm Password"
                                error={errors.password_confirmation?.message}
                                placeholder="Confirm password"
                                disabled={isLoading}
                                value={field.value || ''}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                            />
                        )}
                    />
                </div>
            </div>

            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="user_phone"
                        type="tel"
                        label="Phone"
                        error={errors.phone?.message}
                        placeholder="Enter phone number"
                        disabled={isLoading}
                        {...field}
                        value={field.value || ''}
                    />
                )}
            />

            <Controller
                name="role"
                control={control}
                render={({ field }) => (
                    <FormCombobox<RoleOption>
                        id="role"
                        label="Role"
                        value={selectedRole}
                        onChange={(role) => {
                            // Ensure we're sending the MongoDB ID
                            const roleId = role?._id;
                            if (roleId && typeof roleId === 'string' && roleId.trim() !== '') {
                                field.onChange(roleId);
                            } else {
                                field.onChange('');
                            }
                        }}
                        onSearch={handleRoleSearch}
                        options={roles}
                        displayValue={(role) => role?.name || ''}
                        error={errors.role?.message}
                        disabled={isLoading}
                        placeholder="Search roles..."
                        loading={rolesLoading}
                    />
                )}
            />

            <Controller
                name="status"
                control={control}
                render={({ field }) => (
                    <FormSelect
                        id="user_status"
                        label="Status"
                        error={errors.status?.message}
                        disabled={isLoading}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'inactive', label: 'Inactive' },
                            { value: 'suspended', label: 'Suspended' },
                        ]}
                        {...field}
                        value={field.value || 'active'}
                        onChange={(value: string) => field.onChange(value)}
                        onBlur={() => { }}
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

export default UserForm;
