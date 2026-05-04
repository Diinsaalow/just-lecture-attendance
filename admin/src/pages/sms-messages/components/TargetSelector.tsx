
import React from 'react';
import { Control, Controller, useWatch, FieldErrors } from 'react-hook-form';
import FormMultiSelect from '@/components/form/FormMultiSelect';
import FormSwitch from '@/components/form/FormSwitch';
import { useGetAllLocationsQuery } from '@/store/api/locationApi';
import { useGetAllRecipientGroupsQuery } from '@/store/api/recipientGroupApi';
import { useGetAllRecipientsQuery } from '@/store/api/recipientApi';
import { SmsMessageFormData } from './SmsMessageForm';

interface TargetSelectorProps {
    control: Control<SmsMessageFormData>;
    errors: FieldErrors<SmsMessageFormData>;
    disabled?: boolean;
}

const TargetSelector: React.FC<TargetSelectorProps> = ({ control, errors, disabled }) => {
    const targetAll = useWatch({ control, name: 'targetAll' });

    // API Queries
    const { data: locationsData, isLoading: isLoadingLocations } = useGetAllLocationsQuery({ options: { limit: 1000000 } });
    const { data: groupsData, isLoading: isLoadingGroups } = useGetAllRecipientGroupsQuery({ options: { limit: 1000000 } });
    const { data: recipientsData, isLoading: isLoadingRecipients } = useGetAllRecipientsQuery({ options: { limit: 1000000 } });

    // Options mapping
    const locationOptions = locationsData?.docs?.map((l: any) => ({
        value: l._id,
        label: `${l.district}, ${l.region}`
    })) || [];

    const groupOptions = groupsData?.docs?.map((g: any) => ({
        value: g._id,
        label: g.name
    })) || [];

    const recipientOptions = recipientsData?.docs?.map((r: any) => ({
        value: r._id,
        label: `${r.phoneNumber} ${r.firstName ? `(${r.firstName} ${r.lastName || ''})` : ''}`
    })) || [];

    return (
        <div className="space-y-6 border p-5 rounded-lg bg-gray-50 dark:bg-[#1b2e4b] dark:border-[#191e3a]">
            <h4 className="font-semibold text-lg border-b border-gray-200 dark:border-[#191e3a] pb-2 mb-4">Targeting Criteria</h4>

            <div className="mb-4">
                <Controller
                    name="targetAll"
                    control={control}
                    render={({ field }) => (
                        <FormSwitch
                            id="targetAll"
                            label="Target ALL Recipients"
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={disabled}
                        />
                    )}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-11">
                    If enabled, this message will be sent to ALL recipients in the system. Other criteria will be ignored.
                </p>
            </div>

            {!targetAll && (
                <div className="space-y-4">
                    {/* Locations */}
                    <Controller
                        name="locations"
                        control={control}
                        render={({ field }) => (
                            <FormMultiSelect
                                id="locations"
                                label="Locations"
                                placeholder="Select target locations"
                                options={locationOptions}
                                value={field.value || []}
                                onChange={field.onChange}
                                disabled={disabled || isLoadingLocations}
                                error={errors.locations?.message}
                            />
                        )}
                    />

                    {/* Groups */}
                    <Controller
                        name="groups"
                        control={control}
                        render={({ field }) => (
                            <FormMultiSelect
                                id="groups"
                                label="Recipient Groups"
                                placeholder="Select target groups"
                                options={groupOptions}
                                value={field.value || []}
                                onChange={field.onChange}
                                disabled={disabled || isLoadingGroups}
                                error={errors.groups?.message}
                            />
                        )}
                    />

                    {/* Recipients */}
                    <Controller
                        name="recipients"
                        control={control}
                        render={({ field }) => (
                            <FormMultiSelect
                                id="recipients"
                                label="Individual Recipients"
                                placeholder="Select individual recipients"
                                options={recipientOptions}
                                value={field.value || []}
                                onChange={field.onChange}
                                disabled={disabled || isLoadingRecipients}
                                error={errors.recipients?.message}
                            />
                        )}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Controller
                    name="onlyOptedIn"
                    control={control}
                    render={({ field }) => (
                        <FormSwitch
                            id="onlyOptedIn"
                            label="Only Opted-in Recipients"
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={disabled}
                        />
                    )}
                />
                <Controller
                    name="onlyActive"
                    control={control}
                    render={({ field }) => (
                        <FormSwitch
                            id="onlyActive"
                            label="Only Active Recipients"
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            disabled={disabled}
                        />
                    )}
                />
            </div>
        </div>
    );
};

export default TargetSelector;
