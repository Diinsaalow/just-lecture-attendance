
import React from 'react';
import { useGetRecipientGroupByIdQuery } from '../../../store/api/recipientGroupApi';
import moment from 'moment';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton';
import { IRecipient } from '../../../types/recipient';

interface RecipientGroupDetailProps {
    groupId: string | null;
}

const RecipientGroupDetail: React.FC<RecipientGroupDetailProps> = ({ groupId }) => {
    const idString = groupId || '';
    const { data: group, isLoading } = useGetRecipientGroupByIdQuery(
        idString
            ? { id: idString, params: { populate: [{ path: 'recipients' }] } }
            : '',
        { skip: !idString }
    );

    if (isLoading) {
        return <UserDetailSkeleton />;
    }

    if (!group) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No group selected</p>
            </div>
        );
    }

    const recipients = group.recipients as IRecipient[];

    return (
        <div className="space-y-6 transition-all duration-200 ease-in-out">
            <div>
                <h3 className="text-2xl font-bold mb-1">
                    {group.name}
                </h3>
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${group.isActive ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300">{group.description || 'No description'}</p>
            </div>

            <div className="border-t pt-4 mt-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Members ({recipients?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto space-y-2 mt-3 pr-2 custom-scrollbar">
                    {recipients && recipients.length > 0 ? (
                        recipients.map((recipient) => (
                            <div key={recipient._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-100 dark:border-gray-700">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{recipient.phoneNumber}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${recipient.gender === 'male' ? 'bg-blue-100 text-blue-600' : recipient.gender === 'female' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {recipient.gender || 'N/A'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No recipients in this group</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Created At</h4>
                    <p className="text-gray-700 dark:text-gray-300">{group.createdAt ? moment(group.createdAt).format('MM/DD/YYYY') : '-'}</p>
                </div>
                <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Updated At</h4>
                    <p className="text-gray-700 dark:text-gray-300">{group.updatedAt ? moment(group.updatedAt).format('MM/DD/YYYY') : '-'}</p>
                </div>
            </div>
        </div>
    );
};

export default RecipientGroupDetail;
