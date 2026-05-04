
import React from 'react';
import { ISmsMessage, SmsMessageType } from '../../../types/smsMessage';
import moment from 'moment';
import { useGetTargetsQuery } from '../../../store/api/smsMessageApi';

interface SmsMessageDetailProps {
    message: ISmsMessage;
    onEdit: (message: ISmsMessage) => void;
}

const SmsMessageDetail: React.FC<SmsMessageDetailProps> = ({ message, onEdit }) => {
    const { data: targets, isLoading } = useGetTargetsQuery(message._id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white-100 mb-1">
                        SMS Details
                    </h3>
                    <p className="text-sm text-gray-500">
                        {typeof message.campaign === 'object' ? message.campaign?.name : 'General Message'}
                    </p>
                </div>
                <button
                    onClick={() => onEdit(message)}
                    className="btn btn-outline-primary btn-sm"
                >
                    Edit
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Message Content
                    </label>
                    <div className="bg-gray-100 dark:bg-black/20 p-3 rounded-md mt-1 text-sm whitespace-pre-wrap font-mono border border-gray-200 dark:border-gray-700">
                        {message.content}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Type
                        </label>
                        <p className="capitalize mt-1">
                            <span className={`badge ${message.messageType === SmsMessageType.EDUCATION ? 'badge-outline-primary' :
                                message.messageType === SmsMessageType.REMINDER ? 'badge-outline-warning' :
                                    'badge-outline-info'
                                }`}>
                                {message.messageType}
                            </span>
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                        </label>
                        <p className="mt-1">
                            <span className={`badge ${message.status === 'sent' ? 'badge-success' :
                                message.status === 'failed' ? 'badge-danger' :
                                    'badge-warning'
                                }`}>
                                {message.status}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Scheduled At
                        </label>
                        <p className="text-sm">{message.scheduledAt ? moment(message.scheduledAt).format('MMM D, YYYY h:mm A') : 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Sent At
                        </label>
                        <p className="text-sm">{message.sentAt ? moment(message.sentAt).format('MMM D, YYYY h:mm A') : 'Pending'}</p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md flex justify-between items-center border border-blue-100 dark:border-blue-800">
                    <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Recipients
                    </label>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{message.recipientCount}</p>
                </div>

                {message.failureReason && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800">
                        <span className="font-bold">Failure Reason:</span> {message.failureReason}
                    </div>
                )}
            </div>

            <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Targeting Rules</h4>
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ) : targets && targets.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {targets.map((target) => (
                            <div key={target._id} className="bg-gray-50 dark:bg-black/20 p-3 rounded-md text-sm space-y-2 border border-gray-100 dark:border-gray-800">
                                {target.targetAll ? (
                                    <p className="font-bold text-primary flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        Targets ALL Recipients
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {target.locations && target.locations.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Locations ({target.locations.length})</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(target.locations as any[]).map((loc: any) => (
                                                        <span key={loc._id} className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px]">
                                                            {loc.region || loc.country || loc._id}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {target.groups && target.groups.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Groups ({target.groups.length})</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(target.groups as any[]).map((group: any) => (
                                                        <span key={group._id} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[11px]">
                                                            {group.name || group._id}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {target.recipients && target.recipients.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Individual ({target.recipients.length})</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {(target.recipients as any[]).map((rec: any) => (
                                                        <span key={rec._id} className="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded text-[11px]">
                                                            {rec.phoneNumber || rec._id}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    {target.onlyOptedIn && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">Opt-in Only</span>}
                                    {target.onlyActive && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">Active Only</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No specific targeting rules (might be draft).</p>
                )}
            </div>
        </div>
    );
};

export default SmsMessageDetail;
