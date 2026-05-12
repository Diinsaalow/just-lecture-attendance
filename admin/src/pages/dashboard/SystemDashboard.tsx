import { format } from 'date-fns';
import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    TrendingUp,
    CalendarRange,
    Clock,
    UserMinus,
    FileText,
} from 'lucide-react';
import React, { useState } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import {
    useGetSystemStatusQuery,
    useGetUserGrowthQuery,
    useGetUserDistributionQuery,
    useGetRecentUsersQuery,
} from '../../store/api/dashboardApi';
import { useGetDashboardSummaryQuery } from '../../store/api/lectureReportsApi';

const SystemDashboard: React.FC = () => {
    const [refreshTimestamp, setRefreshTimestamp] = useState(format(new Date(), 'MMM dd, yyyy HH:mm'));

    // RTK Query hooks
    const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useGetSystemStatusQuery();
    const { data: growth, isLoading: growthLoading, refetch: refetchGrowth } = useGetUserGrowthQuery();
    const { data: distribution, isLoading: distributionLoading, refetch: refetchDistribution } = useGetUserDistributionQuery();
    const { data: recentUsers, isLoading: recentLoading, refetch: refetchRecent } = useGetRecentUsersQuery();
    const {
        data: attendanceSummary,
        isLoading: summaryLoading,
        refetch: refetchSummary,
    } = useGetDashboardSummaryQuery();

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchStatus(),
                refetchGrowth(),
                refetchDistribution(),
                refetchRecent(),
                refetchSummary(),
            ]);
            setRefreshTimestamp(format(new Date(), 'MMM dd, yyyy HH:mm'));
        } catch (error) {
            console.error('Error refreshing system dashboard data:', error);
        }
    };

    const presentPct = attendanceSummary?.percentages?.present ?? 0;
    const latePct = attendanceSummary?.percentages?.late ?? 0;
    const absentPct = attendanceSummary?.percentages?.absent ?? 0;
    const statusBreakdown = attendanceSummary?.byStatus ?? {};

    return (
        <div className="space-y-6">
            <DashboardHeader title={'System Dashboard'} dataRefreshTimestamp={refreshTimestamp} onRefresh={handleRefresh} />

            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    count={status?.users.total || 0}
                    previousCount={0} // Backend doesn't provide growth for users yet in simplified version
                    icon={<Users className="w-8 h-8 mr-2" />}
                    linkTo="/users"
                    gradientColors="bg-gradient-to-r from-blue-500 to-blue-600"
                    badgeText="Total"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Active Users"
                    count={status?.users.active || 0}
                    previousCount={0}
                    icon={<UserCheck className="w-8 h-8 mr-2" />}
                    linkTo="/users"
                    gradientColors="bg-gradient-to-r from-green-500 to-green-600"
                    badgeText="Active"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Inactive Users"
                    count={status?.users.inactive || 0}
                    previousCount={0}
                    icon={<UserX className="w-8 h-8 mr-2" />}
                    linkTo="/users"
                    gradientColors="bg-gradient-to-r from-red-500 to-red-600"
                    badgeText="Inactive"
                    showGrowth={false}
                    isLoading={statusLoading}
                />

                <StatCard
                    title="Verified Users"
                    count={status?.users.verified || 0}
                    previousCount={0}
                    icon={<ShieldCheck className="w-8 h-8 mr-2" />}
                    linkTo="/users"
                    gradientColors="bg-gradient-to-r from-indigo-500 to-indigo-600"
                    badgeText="Verified"
                    showGrowth={false}
                    isLoading={statusLoading}
                />
            </div>

            {/* Attendance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Sessions"
                    count={attendanceSummary?.totalSessions || 0}
                    previousCount={0}
                    icon={<CalendarRange className="w-8 h-8 mr-2" />}
                    linkTo="/class-sessions"
                    gradientColors="bg-gradient-to-r from-cyan-500 to-cyan-600"
                    badgeText="Sessions"
                    showGrowth={false}
                    isLoading={summaryLoading}
                />
                <StatCard
                    title="Present %"
                    count={Math.round(presentPct)}
                    previousCount={0}
                    displayValue={`${presentPct.toFixed(1)}%`}
                    icon={<UserCheck className="w-8 h-8 mr-2" />}
                    linkTo="/reports"
                    gradientColors="bg-gradient-to-r from-emerald-500 to-emerald-600"
                    badgeText="On-time"
                    showGrowth={false}
                    isLoading={summaryLoading}
                />
                <StatCard
                    title="Late %"
                    count={Math.round(latePct)}
                    previousCount={0}
                    displayValue={`${latePct.toFixed(1)}%`}
                    icon={<Clock className="w-8 h-8 mr-2" />}
                    linkTo="/reports"
                    gradientColors="bg-gradient-to-r from-amber-500 to-amber-600"
                    badgeText="Late"
                    showGrowth={false}
                    isLoading={summaryLoading}
                />
                <StatCard
                    title="Absent %"
                    count={Math.round(absentPct)}
                    previousCount={0}
                    displayValue={`${absentPct.toFixed(1)}%`}
                    icon={<UserMinus className="w-8 h-8 mr-2" />}
                    linkTo="/reports"
                    gradientColors="bg-gradient-to-r from-rose-500 to-rose-600"
                    badgeText="Absent"
                    showGrowth={false}
                    isLoading={summaryLoading}
                />
            </div>

            {/* Pending submissions banner */}
            {!!attendanceSummary?.pendingSubmissions && (
                <div className="panel flex items-start gap-3 border border-amber-200 dark:border-amber-700/40">
                    <FileText className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold">
                            {attendanceSummary.pendingSubmissions} pending submission(s)
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review absence / late-arrival / early-leave requests submitted by
                            instructors.
                        </p>
                    </div>
                    <a href="/submissions" className="btn btn-outline-warning btn-sm">
                        Review
                    </a>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="User Growth"
                    subtitle="Monthly registration trends"
                    type="line"
                    series={growth ? [{ name: 'Users', data: growth.data }] : []}
                    options={{
                        xaxis: {
                            categories: growth?.labels || [],
                        },
                        colors: ['#3b82f6'],
                    }}
                    loading={growthLoading}
                />

                <ChartCard
                    title="User Distribution"
                    subtitle="Users by status"
                    type="donut"
                    series={distribution?.data || []}
                    options={{
                        labels: distribution?.labels || [],
                        colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
                    }}
                    loading={distributionLoading}
                />
            </div>

            {/* Attendance breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                    title="Attendance breakdown"
                    subtitle="All records by status"
                    type="donut"
                    series={Object.values(statusBreakdown).map((n) => Number(n) || 0)}
                    options={{
                        labels: Object.keys(statusBreakdown),
                        colors: [
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#3b82f6',
                            '#a855f7',
                            '#64748b',
                            '#0ea5e9',
                        ],
                    }}
                    loading={summaryLoading}
                />
                <div className="panel">
                    <h5 className="font-semibold text-lg mb-3 dark:text-white-light">
                        Attendance percentages
                    </h5>
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                            <span>Present</span>
                            <span className="font-semibold">{presentPct.toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Late</span>
                            <span className="font-semibold">{latePct.toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Absent</span>
                            <span className="font-semibold">{absentPct.toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                            <span>Excused</span>
                            <span className="font-semibold">
                                {(attendanceSummary?.percentages?.excused ?? 0).toFixed(1)}%
                            </span>
                        </li>
                        <li className="flex justify-between">
                            <span>Early checkout</span>
                            <span className="font-semibold">
                                {(attendanceSummary?.percentages?.earlyCheckout ?? 0).toFixed(1)}%
                            </span>
                        </li>
                        <li className="flex justify-between">
                            <span>Missed checkout</span>
                            <span className="font-semibold">
                                {(attendanceSummary?.percentages?.missedCheckout ?? 0).toFixed(1)}%
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="panel">
                <div className="mb-5 flex items-center justify-between">
                    <h5 className="font-semibold text-lg dark:text-white-light">Recent Users</h5>
                    <TrendingUp className="text-primary w-5 h-5" />
                </div>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Joined At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4}><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div></td>
                                    </tr>
                                ))
                            ) : recentUsers && recentUsers.length > 0 ? (
                                recentUsers.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.firstName} {user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.status === 'active' ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">No recent users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemDashboard;
