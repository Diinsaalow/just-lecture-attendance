import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useUpdateSmsProviderFormMutation } from '../../../store/api/smsProviderApi';
import { ISmsProvider } from '../../../types/sms';
import FormInput from '../../../components/form/FormInput';
import FormSwitch from '../../../components/form/FormSwitch';
import { toast } from 'sonner';
import ActionButton from '../../../components/ActionButton';
import { ProviderFormSkeleton } from '../../../components/skeleton';

interface SmsProviderFormProps {
    provider?: ISmsProvider;
    loading?: boolean;
}

type FormValues = {
    name: string;
    active: boolean;
    parameters: Record<string, any>;
};

const SmsProviderForm: React.FC<SmsProviderFormProps> = ({ provider, loading }) => {
    // Update SMS provider mutation
    const [updateSmsProvider, { isLoading: isUpdating }] = useUpdateSmsProviderFormMutation();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            name: provider?.name ?? '',
            active: provider?.status === 'active',
            parameters: provider?.parameters ?? {},
        },
    });

    React.useEffect(() => {
        reset({
            name: provider?.name ?? '',
            active: provider?.status === 'active',
            parameters: provider?.parameters ?? {},
        });
    }, [provider, reset]);

    // Loading skeleton
    if (loading) {
        return <ProviderFormSkeleton parameterCount={Object.keys(provider?.parameters || {}).length} />;
    }

    if (!provider) return <div>Select an SMS provider</div>;

    const onSubmit = async (data: FormValues) => {
        try {
            await updateSmsProvider({
                h_id: provider._id,
                data: {
                    name: data.name,
                    active: data.active,
                    parameters: data.parameters,
                },
            }).unwrap();
            toast.success('SMS provider updated successfully');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update SMS provider');
        }
    };

    return (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Name field - positioned at the top */}
            <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                    <FormInput
                        label="SMS Provider Name"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        disabled={isUpdating}
                        error={errors.name?.message}
                        placeholder="Enter SMS provider name"
                    />
                )}
            />

            {/* Dynamic parameters fields */}
            <>
                {provider.parameters &&
                    Object.keys(provider.parameters).map((key) => {
                        const isPassword = /secret|key|password/i.test(key);
                        return (
                            <Controller
                                key={key}
                                name={`parameters.${key}`}
                                control={control}
                                render={({ field }) => (
                                    <FormInput
                                        label={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        disabled={isUpdating}
                                        error={typeof errors.parameters?.[key]?.message === 'string' ? errors.parameters?.[key]?.message : undefined}
                                        type={isPassword ? 'password' : 'text'}
                                    />
                                )}
                            />
                        );
                    })}
            </>

            {/* is_active switch at the end */}
            <Controller
                name="active"
                control={control}
                render={({ field }) => <FormSwitch label="Active" checked={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={isUpdating} />}
            />
            <div className="md:col-span-2 mt-6">
                <ActionButton type="submit" variant="primary" isLoading={isUpdating} displayText="Save" />
            </div>
        </form>
    );
};

export default SmsProviderForm;
