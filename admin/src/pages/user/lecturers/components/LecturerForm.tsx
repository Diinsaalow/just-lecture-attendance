import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../../components/ActionButton';
import FormInput from '../../../../components/form/FormInput';
import FormSelect from '../../../../components/form/FormSelect';
import { useCreateLecturerMutation, useUpdateLecturerMutation } from '../../../../store/api/lecturerApi';
import { userApi } from '../../../../store/api/userApi';
import { useGetAllFacultiesQuery } from '../../../../store/api/facultyApi';
import type { IUser } from '../../../../types/auth';
import { formatJamhuriyaUsername } from '../../../../utils/jamhuriyaUsername';

const schemaCreate = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    phone: z.string().optional(),
    passcode: z.string().min(6, 'At least 6 characters'),
    facultyId: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

const schemaEdit = z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    phone: z.string().optional(),
    passcode: z.union([z.string().min(6, 'At least 6 characters'), z.literal('')]).optional(),
    facultyId: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

type FormCreate = z.infer<typeof schemaCreate>;
type FormEdit = z.infer<typeof schemaEdit>;

const STATUS_OPTS = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
];

const PASSCODE_GENERATE_LEN = 6;
const PASSCODE_ALPHABET = '0123456789';

function generatePasscode(): string {
    const bytes = new Uint32Array(PASSCODE_GENERATE_LEN);
    crypto.getRandomValues(bytes);
    let out = '';
    for (let i = 0; i < PASSCODE_GENERATE_LEN; i++) {
        out += PASSCODE_ALPHABET[bytes[i]! % PASSCODE_ALPHABET.length];
    }
    return out;
}

function isSuperAdminUser(user: IUser | null): boolean {
    if (!user) return false;
    const r = user.role;
    const name = typeof r === 'string' ? r : (r as { name?: string })?.name;
    return name?.toLowerCase() === 'super-admin';
}

interface Props {
    itemToEdit?: IUser | null;
    suggestedUsername?: string;
    onClose: () => void;
    currentUser: IUser | null;
}

const LecturerForm: React.FC<Props> = ({ itemToEdit, suggestedUsername, onClose, currentUser }) => {
    const isEdit = Boolean(itemToEdit);
    const dispatch = useDispatch();
    const superAdmin = isSuperAdminUser(currentUser);

    const { data: facRes } = useGetAllFacultiesQuery({ query: {}, options: { limit: 200, page: 1 } });
    const facOpts = (facRes?.docs ?? []).map((f) => ({ value: f._id, label: f.name }));

    const [createLecturer] = useCreateLecturerMutation();
    const [updateLecturer] = useUpdateLecturerMutation();

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<FormCreate | FormEdit>({
        resolver: zodResolver(isEdit ? schemaEdit : schemaCreate),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            passcode: '',
            facultyId: '',
            status: 'active',
        },
    });

    useEffect(() => {
        if (itemToEdit) {
            const fid =
                itemToEdit.facultyId &&
                typeof itemToEdit.facultyId === 'object' &&
                '_id' in itemToEdit.facultyId
                    ? (itemToEdit.facultyId as { _id: string })._id
                    : typeof itemToEdit.facultyId === 'string'
                      ? itemToEdit.facultyId
                      : '';
            reset({
                firstName: itemToEdit.firstName || '',
                lastName: itemToEdit.lastName || '',
                phone: itemToEdit.phone || '',
                passcode: '',
                facultyId: fid,
                status: (itemToEdit.status as 'active' | 'inactive' | 'suspended') || 'active',
            });
        } else {
            reset({
                firstName: '',
                lastName: '',
                phone: '',
                passcode: '',
                facultyId: '',
                status: 'active',
            });
        }
    }, [itemToEdit, reset]);

    const invalidateUserLists = () => {
        dispatch(userApi.util.invalidateTags([{ type: 'users', id: 'LIST' }]));
    };

    const onSubmit = async (data: FormCreate | FormEdit) => {
        try {
            if (isEdit && itemToEdit) {
                const payload: Record<string, unknown> = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone || undefined,
                    status: data.status,
                };
                if (data.passcode && String(data.passcode).length >= 6) {
                    payload.passcode = data.passcode;
                }
                if (superAdmin && 'facultyId' in data && data.facultyId) {
                    payload.facultyId = data.facultyId;
                }
                await updateLecturer({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Lecturer updated');
            } else {
                const d = data as FormCreate;
                const payload: Record<string, unknown> = {
                    firstName: d.firstName,
                    lastName: d.lastName,
                    phone: d.phone || undefined,
                    passcode: d.passcode,
                    status: d.status ?? 'active',
                };
                if (superAdmin && d.facultyId) {
                    payload.facultyId = d.facultyId;
                }
                await createLecturer(payload).unwrap();
                toast.success('Lecturer created');
            }
            invalidateUserLists();
            onClose();
            reset();
        } catch (error: unknown) {
            const msg =
                typeof error === 'object' && error !== null && 'data' in error
                    ? String((error as { data?: { message?: string } }).data?.message)
                    : '';
            toast.error(msg || 'Failed');
        }
    };

    const displayUsername = itemToEdit?.username
        ? formatJamhuriyaUsername(itemToEdit.username)
        : suggestedUsername
          ? formatJamhuriyaUsername(suggestedUsername)
          : '—';

    const fillGeneratedPasscode = () => {
        const pw = generatePasscode();
        setValue('passcode', pw, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
                id="l-username"
                label="Username"
                value={displayUsername}
                onChange={() => {}}
                onBlur={() => {}}
                readOnly
                className="font-mono !bg-gray-50 dark:!bg-gray-800/50 cursor-default"
            />
           

            <Controller name="firstName" control={control} render={({ field }) => <FormInput id="l-fn" label="First name" error={errors.firstName?.message} disabled={isSubmitting} {...field} />} />
            <Controller name="lastName" control={control} render={({ field }) => <FormInput id="l-ln" label="Last name" error={errors.lastName?.message} disabled={isSubmitting} {...field} />} />
            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <FormInput id="l-ph" label="Phone" disabled={isSubmitting} {...field} value={field.value ?? ''} />
                )}
            />

            {superAdmin && (
                <Controller
                    name="facultyId"
                    control={control}
                    render={({ field: { value, onChange, onBlur } }) => (
                        <FormSelect
                            id="l-fac"
                            label="Faculty (optional)"
                            value={value || ''}
                            onChange={onChange}
                            onBlur={onBlur}
                            options={[{ value: '', label: '— None —' }, ...facOpts]}
                            disabled={isSubmitting}
                        />
                    )}
                />
            )}

            {!isEdit && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <Controller
                            name="passcode"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    id="l-pw"
                                    type="password"
                                    label="Passcode"
                                    error={(errors as { passcode?: { message?: string } }).passcode?.message}
                                    disabled={isSubmitting}
                                    {...field}
                                    value={field.value ?? ''}
                                    placeholder="Min 6 characters"
                                />
                            )}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-primary mb-0.5 shrink-0 whitespace-nowrap"
                        disabled={isSubmitting}
                        onClick={fillGeneratedPasscode}
                    >
                        Generate passcode
                    </button>
                </div>
            )}
            {isEdit && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
                    <div className="min-w-0 flex-1">
                        <Controller
                            name="passcode"
                            control={control}
                            render={({ field }) => (
                                <FormInput
                                    id="l-pw2"
                                    type="password"
                                    label="New passcode (leave blank to keep)"
                                    error={(errors as { passcode?: { message?: string } }).passcode?.message}
                                    disabled={isSubmitting}
                                    {...field}
                                    value={field.value ?? ''}
                                    placeholder="Optional"
                                />
                            )}
                        />
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-primary mb-0.5 shrink-0 whitespace-nowrap"
                        disabled={isSubmitting}
                        onClick={fillGeneratedPasscode}
                    >
                        Generate passcode
                    </button>
                </div>
            )}

            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="l-st" label="Status" value={value || 'active'} onChange={onChange} onBlur={onBlur} options={STATUS_OPTS} disabled={isSubmitting} />
                )}
            />

            <div className="flex justify-end mt-6 gap-3">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Create'} />
            </div>
        </form>
    );
};

export default LecturerForm;
