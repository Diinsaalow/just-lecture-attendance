import React from 'react';
import { useGetRecipientByIdQuery } from '../../../store/api/recipientApi';
import moment from 'moment';
import UserDetailSkeleton from '../../../components/skeleton/UserDetailSkeleton';

interface RecipientDetailProps {
  recipientId: string | null;
}

const RecipientDetail: React.FC<RecipientDetailProps> = ({ recipientId }) => {
  const idString = recipientId || '';
  const { data: recipient, isLoading } = useGetRecipientByIdQuery(idString, { skip: !idString });

  if (isLoading) {
    return <UserDetailSkeleton />;
  }

  if (!recipient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No recipient selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 transition-all duration-200 ease-in-out">
      <div>
        <h3 className="text-2xl font-bold mb-1">
          {recipient.phoneNumber}
        </h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${recipient.isActive ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'}`}>
            {recipient.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${recipient.optInStatus ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'}`}>
            {recipient.optInStatus ? 'Opted In' : 'Opted Out'}
          </span>
        </div>
      </div>

      <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Language</h4>
        <p className="text-gray-700 dark:text-gray-300 font-bold">{recipient.languageCode}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Created At</h4>
          <p className="text-gray-700 dark:text-gray-300">{recipient.createdAt ? moment(recipient.createdAt).format('MM/DD/YYYY') : '-'}</p>
        </div>
        <div className="transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded-md">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Updated At</h4>
          <p className="text-gray-700 dark:text-gray-300">{recipient.updatedAt ? moment(recipient.updatedAt).format('MM/DD/YYYY') : '-'}</p>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">ID</h4>
        <p className="text-gray-700 dark:text-gray-300">{recipient._id}</p>
      </div>
    </div>
  );
};

export default RecipientDetail;
