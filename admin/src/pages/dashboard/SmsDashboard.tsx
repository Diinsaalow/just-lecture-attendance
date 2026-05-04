import { format } from 'date-fns';
import { AlertCircle, BarChart3, CheckCircle2, ChevronRight, Clock, List, Megaphone, MessageCircle, MessageSquare, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import {
    useGetSmsStatusQuery,
    useGetCampaignTrendsQuery,
    useGetFeedbackDistributionQuery,
    useGetDeliveryDistributionQuery,
    useGetRecentCampaignsQuery,
    useGetRecentFeedbackQuery,
    useGetDeliveryTrendsQuery,
    useGetFeedbackTrendsQuery,
} from '../../store/api/dashboardApi';

const SmsDashboard: React.FC = () => {
    const [refreshTimestamp, setRefreshTimestamp] = useState(format(new Date(), 'MMM dd, yyyy HH:mm'));

    // RTK Query hooks
    const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useGetSmsStatusQuery();
    const { data: feedbackTrends, isLoading: feedbackTrendsLoading, refetch: refetchFeedbackTrends } = useGetFeedbackTrendsQuery();
    const { data: deliveryTrends, isLoading: deliveryTrendsLoading, refetch: refetchDeliveryTrends } = useGetDeliveryTrendsQuery();
    const { data: feedbackDistribution, isLoading: feedbackLoading, refetch: refetchFeedback } = useGetFeedbackDistributionQuery();
    const { data: deliveryDistribution, isLoading: deliveryLoading, refetch: refetchDelivery } = useGetDeliveryDistributionQuery();
    const { data: recentCampaigns, isLoading: recentCampaignLoading, refetch: refetchRecentCampaigns } = useGetRecentCampaignsQuery();
    const { data: recentFeedback, isLoading: recentFeedbackLoading, refetch: refetchRecentFeedback } = useGetRecentFeedbackQuery();

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchStatus(),
                refetchFeedbackTrends(),
                refetchDeliveryTrends(),
                refetchFeedback(),
                refetchDelivery(),
                refetchRecentCampaigns(),
                refetchRecentFeedback(),
            ]);
            setRefreshTimestamp(format(new Date(), 'MMM dd, yyyy HH:mm'));
        } catch (error) {
            console.error('Error refreshing SMS dashboard data:', error);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardHeader title={'SMS & Campaign Dashboard'} dataRefreshTimestamp={refreshTimestamp} onRefresh={handleRefresh} />

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    title="Active Campaigns"
                    count={status?.campaigns.active || 0}
                    previousCount={0}
                    icon={<Megaphone className="w-8 h-8 mr-2" />}
                    linkTo="/campaigns"
                    gradientColors="bg-gradient-to-r from-blue-500 to-blue-600"
                    badgeText="Campaigns"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Delivered SMS"
                    count={status?.delivery.delivered || 0}
                    displayValue={`${status?.delivery.delivered || 0} (${status?.delivery.rate || 0}%)`}
                    previousCount={status?.messages.pending || 0}
                    icon={<CheckCircle2 className="w-8 h-8 mr-2" />}
                    linkTo="/sms-messages"
                    gradientColors="bg-gradient-to-r from-green-500 to-green-600"
                    badgeText={`${status?.messages.pending || 0} Pending`}
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Feedback Received"
                    count={status?.feedback.total || 0}
                    displayValue={`${status?.feedback.total || 0} (${status?.feedback.rate || 0}%)`}
                    previousCount={0}
                    icon={<MessageCircle className="w-8 h-8 mr-2" />}
                    linkTo="/reports"
                    gradientColors="bg-gradient-to-r from-purple-500 to-purple-600"
                    badgeText="Response Rate"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Auto-Reply Rules"
                    count={status?.feedback.autoReplies || 0}
                    previousCount={0}
                    icon={<MessageSquare className="w-8 h-8 mr-2" />}
                    linkTo="/settings/auto-reply-rules"
                    gradientColors="bg-gradient-to-r from-indigo-500 to-indigo-600"
                    badgeText="Rules"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Delivery Failures"
                    count={status?.delivery.failed || 0}
                    previousCount={0}
                    icon={<AlertCircle className="w-8 h-8 mr-2" />}
                    linkTo="/sms-messages"
                    gradientColors="bg-gradient-to-r from-red-500 to-red-600"
                    badgeText="Failures"
                    showGrowth={false}
                    isLoading={statusLoading}
                />
            </div>

            {/* Trends Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Feedback Trends"
                    subtitle="Monthly responses received"
                    type="area"
                    series={[
                        {
                            name: 'Feedback',
                            data: feedbackTrends?.data || [],
                            color: '#8b5cf6', // purple-500
                        },
                    ]}
                    options={{
                        xaxis: {
                            categories: feedbackTrends?.labels || [],
                        },
                        stroke: {
                            curve: 'smooth'
                        }
                    }}
                    loading={feedbackTrendsLoading}
                />

                <ChartCard
                    title="Delivery Trends"
                    subtitle="Delivered vs Failed"
                    type="area"
                    series={[
                        {
                            name: 'Delivered',
                            data: deliveryTrends?.delivered || [],
                            color: '#10b981', // green-500
                        },
                        {
                            name: 'Failed',
                            data: deliveryTrends?.failed || [],
                            color: '#ef4444', // red-500
                        },
                    ]}
                    options={{
                        xaxis: {
                            categories: deliveryTrends?.labels || [],
                        },
                        stroke: {
                            curve: 'smooth'
                        }
                    }}
                    loading={deliveryTrendsLoading}
                />
            </div>

            {/* Distribution Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Delivery Distribution"
                    subtitle="SMS statuses"
                    type="donut"
                    series={deliveryDistribution?.data || []}
                    options={{
                        labels: deliveryDistribution?.labels || [],
                        colors: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
                    }}
                    loading={deliveryLoading}
                />

                <ChartCard
                    title="Feedback Types"
                    subtitle="Distribution by response type"
                    type="pie"
                    series={feedbackDistribution?.data || []}
                    options={{
                        labels: feedbackDistribution?.labels || [],
                    }}
                    loading={feedbackLoading}
                />
            </div>

            {/* Activity Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Campaigns */}
                <div className="panel">
                    <div className="mb-5 flex items-center justify-between">
                        <h5 className="font-semibold text-lg dark:text-white-light">Recent Campaigns</h5>
                        <Megaphone className="text-primary w-5 h-5" />
                    </div>
                    <div className="space-y-4">
                        {recentCampaignLoading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : recentCampaigns && recentCampaigns.length > 0 ? (
                            recentCampaigns.map((camp) => (
                                <div key={camp._id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                        <Megaphone className="text-primary w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h6 className="font-medium text-gray-900 dark:text-white">{camp.name}</h6>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {format(new Date(camp.startDate), 'MMM dd')} - {format(new Date(camp.endDate), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <span className={`badge ${camp.status === 'active' ? 'badge-outline-success' : 'badge-outline-info'}`}>
                                        {camp.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">No recent campaigns</div>
                        )}
                    </div>
                </div>

                {/* Recent Feedbacks */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Recent Positive Feedback</h3>
                        <Link to="/reports" className="text-primary text-sm hover:underline flex items-center">
                            View all <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentFeedbackLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : !recentFeedback || recentFeedback.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No feedback responses found</p>
                        ) : (
                            recentFeedback.map((fb) => (
                                <div key={fb._id} className="p-3 border-l-4 border-success bg-success/5 rounded-r-lg mb-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-xs text-success">
                                            {fb.phoneNumber || fb.recipient?.phoneNumber || 'Unknown Sender'}
                                        </span>
                                        <span className="text-[10px] text-gray-400">{format(new Date(fb.receivedAt), 'MMM dd, HH:mm')}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{fb.responseText}"</p>
                                    <div className="mt-2 flex items-center text-[10px] text-gray-500">
                                        <span className="mr-3">Campaign: {fb.campaign?.name || 'Unknown'}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${fb.riskLevel === 'high' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                            Risk: {fb.riskLevel}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmsDashboard;
