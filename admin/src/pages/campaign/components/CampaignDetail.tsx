import React from 'react';
import { useGetCampaignByIdQuery } from '../../../store/api/campaignApi';
import moment from 'moment';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton'; // Reusing skeleton

interface CampaignDetailProps {
    campaignId: string | null;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaignId }) => {
    const idString = campaignId ? (campaignId as unknown as string) : '';
    const { data: campaign, isLoading } = useGetCampaignByIdQuery(idString, { skip: !idString });

    if (isLoading) {
        return <UserDetailSkeleton />;
    }

    if (!campaign) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No campaign selected</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            <div>
                <h3 className="text-2xl font-bold mb-1">
                    {campaign.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                </span>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{campaign.description || 'No description'}</p>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Audience Size</h4>
                <p className="text-gray-700 dark:text-gray-300 font-bold">{campaign.targetAudienceSize}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Start Date</h4>
                    <p className="text-gray-700 dark:text-gray-300">{campaign.startDate ? moment(campaign.startDate).format('MM/DD/YYYY') : '-'}</p>
                </div>
                <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">End Date</h4>
                    <p className="text-gray-700 dark:text-gray-300">{campaign.endDate ? moment(campaign.endDate).format('MM/DD/YYYY') : '-'}</p>
                </div>
            </div>

            <div className="border-t pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">ID</h4>
                <p className="text-gray-700 dark:text-gray-300">{campaign._id}</p>
            </div>
        </div>
    );
};

export default CampaignDetail;
