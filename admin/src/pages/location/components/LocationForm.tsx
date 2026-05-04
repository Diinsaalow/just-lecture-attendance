import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormInput from '../../../components/form/FormInput';
import { useCreateLocationMutation, useUpdateLocationMutation } from '../../../store/api/locationApi';
import { ILocation } from '../../../types/location';

const locationSchema = z.object({
    country: z.string().min(1, 'Country is required'),
    region: z.string().min(1, 'Region is required'),
    district: z.string().min(1, 'District is required'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
    locationToEdit?: ILocation | null;
    onClose: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ locationToEdit, onClose }) => {
    const isEditMode = Boolean(locationToEdit);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            country: '',
            region: '',
            district: '',
        },
    });

    const [createLocation] = useCreateLocationMutation();
    const [updateLocation] = useUpdateLocationMutation();

    useEffect(() => {
        if (locationToEdit) {
            reset({
                country: locationToEdit.country,
                region: locationToEdit.region,
                district: locationToEdit.district,
            });
        }
    }, [locationToEdit, reset]);

    const onSubmit = async (data: LocationFormData) => {
        try {
            if (isEditMode && locationToEdit) {
                await updateLocation({ id: locationToEdit._id, data }).unwrap();
                toast.success('Location updated successfully');
            } else {
                await createLocation(data).unwrap();
                toast.success('Location created successfully');
            }
            onClose();
            reset();
        } catch (error: any) {
            toast.error(error?.data?.message || 'An error occurred');
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="country"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="country"
                        type="text"
                        label="Country"
                        error={errors.country?.message}
                        placeholder="Enter country"
                        disabled={isSubmitting}
                        {...field}
                    />
                )}
            />

            <Controller
                name="region"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="region"
                        type="text"
                        label="Region"
                        error={errors.region?.message}
                        placeholder="Enter region"
                        disabled={isSubmitting}
                        {...field}
                    />
                )}
            />

            <Controller
                name="district"
                control={control}
                render={({ field }) => (
                    <FormInput
                        id="district"
                        type="text"
                        label="District"
                        error={errors.district?.message}
                        placeholder="Enter district"
                        disabled={isSubmitting}
                        {...field}
                    />
                )}
            />

            <div className="flex justify-end mt-8">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} isLoading={false} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    loadingText={isEditMode ? 'Updating...' : 'Saving...'}
                    displayText={isEditMode ? 'Update' : 'Save'}
                    className="ltr:ml-4 rtl:mr-4"
                />
            </div>
        </form>
    );
};

export default LocationForm;
