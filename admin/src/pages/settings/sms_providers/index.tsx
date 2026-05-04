import React, { useState } from 'react';
import SmsProviderForm from './SmsProviderForm';
import { useGetSmsProvidersListQuery } from '../../../store/api/smsProviderApi';
import { ISmsProvider } from '../../../types/sms';

const tabButtonClass = (active: boolean) =>
    `px-8 py-2 rounded-t-lg font-medium text-base focus:outline-none transition-colors ${active ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-primary/10'}`;

const SmsProvidersIndex: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const { data, isLoading } = useGetSmsProvidersListQuery();
    const providers = data || [];

    // Set default selectedId to first provider
    React.useEffect(() => {
        if (!selectedId && providers.length > 0) {
            setSelectedId(providers[0]._id);
        }
    }, [providers, selectedId]);

    const selectedProvider = providers.find((p: ISmsProvider) => p._id === selectedId);
    const loading = isLoading || !selectedProvider;

    return (
        <div className="w-full">
            {/* Tab bar for SMS providers */}
            <div className="flex flex-row gap-2 border-b mb-0">
                {providers.map((provider: ISmsProvider) => (
                    <button key={provider._id} className={tabButtonClass(selectedId === provider._id)} onClick={() => setSelectedId(provider._id)} type="button">
                        {provider.name}
                    </button>
                ))}
            </div>
            {/* Card panel for the form */}
            <div className="panel mt-0 p-8 bg-white rounded-b-lg shadow-md border-t-0">
                <SmsProviderForm provider={selectedProvider} loading={loading} />
            </div>
        </div>
    );
};

export default SmsProvidersIndex;
