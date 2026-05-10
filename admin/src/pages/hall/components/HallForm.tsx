import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import FormSelect from '../../../components/form/FormSelect';
import { ENTITY_STATUS_OPTIONS } from '../../../constants/entityStatus';
import { useCreateHallMutation, useUpdateHallMutation } from '../../../store/api/hallApi';
import { useGetAllCampusesQuery } from '../../../store/api/campusApi';
import type { IHall } from '../../../types/hall';

const schema = z
    .object({
        name: z.string().min(1, 'Name is required'),
        code: z.string().min(1, 'Code is required'),
        campusId: z.string().min(1, 'Campus is required'),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        geofenceRadiusMeters: z.string().optional(),
        capacity: z.string().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.capacity && data.capacity.trim() !== '') {
            const n = Number(data.capacity);
            if (!Number.isFinite(n) || n < 0) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter a valid capacity (0 or more)', path: ['capacity'] });
            }
        }
    });

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IHall | null;
    onClose: () => void;
}

function campusIdString(campusId: IHall['campusId']): string {
    if (typeof campusId === 'string') return campusId;
    return campusId._id;
}

const HallForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: cRes } = useGetAllCampusesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const campusOpts = useMemo(() => (cRes?.docs ?? []).map((c) => ({ value: c._id, label: c.campusName })), [cRes]);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            code: '',
            campusId: '',
            latitude: '',
            longitude: '',
            geofenceRadiusMeters: '50',
            capacity: '',
            status: 'ACTIVE',
        },
    });

    const [createItem] = useCreateHallMutation();
    const [updateItem] = useUpdateHallMutation();

    useEffect(() => {
        if (itemToEdit) {
            reset({
                name: itemToEdit.name,
                code: itemToEdit.code,
                campusId: campusIdString(itemToEdit.campusId),
                latitude: itemToEdit.latitude != null ? String(itemToEdit.latitude) : '',
                longitude: itemToEdit.longitude != null ? String(itemToEdit.longitude) : '',
                geofenceRadiusMeters: itemToEdit.geofenceRadiusMeters != null ? String(itemToEdit.geofenceRadiusMeters) : '50',
                capacity: itemToEdit.capacity != null ? String(itemToEdit.capacity) : '',
                status: itemToEdit.status,
            });
        }
    }, [itemToEdit, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            const cap =
                data.capacity && data.capacity.trim() !== '' ? Number(data.capacity) : undefined;
            const lat = data.latitude?.trim() === '' ? undefined : Number(data.latitude);
            const lng = data.longitude?.trim() === '' ? undefined : Number(data.longitude);
            const radius = data.geofenceRadiusMeters?.trim() === '' ? undefined : Number(data.geofenceRadiusMeters);
            const payload = {
                name: data.name,
                code: data.code,
                campusId: data.campusId,
                latitude: lat,
                longitude: lng,
                geofenceRadiusMeters: radius,
                capacity: cap,
                status: data.status,
            };
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Hall updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Hall created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            const msg = (error as { data?: { message?: string } })?.data?.message;
            toast.error(msg || 'Request failed');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field }) => <FormInput id="hall-name" type="text" label="Hall name" error={errors.name?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="code"
                control={control}
                render={({ field }) => <FormInput id="hall-code" type="text" label="Code" error={errors.code?.message} disabled={isSubmitting} {...field} />}
            />
            <Controller
                name="campusId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="hall-campus"
                        label="Campus"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={campusOpts}
                        disabled={isSubmitting}
                        error={errors.campusId?.message}
                    />
                )}
            />
            <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                    <FormInput id="hall-lat" type="number" step="any" label="Latitude" error={errors.latitude?.message} disabled={isSubmitting} {...field} value={field.value || ''} />
                )}
            />
            <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                    <FormInput id="hall-lng" type="number" step="any" label="Longitude" error={errors.longitude?.message} disabled={isSubmitting} {...field} value={field.value || ''} />
                )}
            />
            <Controller
                name="geofenceRadiusMeters"
                control={control}
                render={({ field }) => (
                    <FormInput id="hall-radius" type="number" min={0} label="Geofence Radius (Meters)" error={errors.geofenceRadiusMeters?.message} disabled={isSubmitting} {...field} value={field.value || ''} />
                )}
            />
            <Controller
                name="capacity"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="hall-capacity"
                        type="number"
                        min={0}
                        label="Capacity"
                        error={errors.capacity?.message}
                        disabled={isSubmitting}
                        name={field.name}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        value={field.value || ''}
                        onChange={(v: string) => field.onChange(v)}
                    />
                )}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="hall-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText={isEdit ? 'Updating...' : 'Saving...'}
                    displayText={isEdit ? 'Update' : 'Save'}
                    className="ltr:ml-4 rtl:mr-4"
                />
            </div>
        </form>
    );
};

export default HallForm;
