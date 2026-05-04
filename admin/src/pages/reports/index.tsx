import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Megaphone,
    MessageSquare,
    Flag,
    MapPin,
    UserCheck,
    ArrowRight
} from 'lucide-react';

const ReportCard = ({
    title,
    description,
    icon: Icon,
    path,
    color
}: {
    title: string;
    description: string;
    icon: any;
    path: string;
    color: string;
}) => (
    <NavLink
        to={path}
        className="panel hover:shadow-lg transition-all duration-300 group overflow-hidden relative"
    >
        <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={120} />
        </div>
        <div className="flex items-start justify-between relative z-10">
            <div className={`p-3 rounded-xl ${color} text-white mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                <Icon size={24} />
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <div className="relative z-10">
            <h5 className="font-bold text-lg mb-1">{title}</h5>
            <p className="text-white-dark text-sm">{description}</p>
        </div>
    </NavLink>
);

const ReportsIndex = () => {
    const reportTypes = [
        {
            title: 'Campaign Performance',
            description: 'Analyze campaign reach, status breakdown, and overall effectiveness.',
            icon: Megaphone,
            path: '/reports/campaigns',
            color: 'bg-primary'
        },
        {
            title: 'SMS Delivery Metrics',
            description: 'Track delivery success rates, failure reasons, and message volume.',
            icon: MessageSquare,
            path: '/reports/sms',
            color: 'bg-success'
        },
        {
            title: 'User Feedback & Risks',
            description: 'Monitor high-risk responses and categorize user feedback sentiments.',
            icon: Flag,
            path: '/reports/feedback',
            color: 'bg-danger'
        },
        {
            title: 'Recipient Demographics',
            description: 'Geographic distribution and active status reports of your audience.',
            icon: MapPin,
            path: '/reports/recipients',
            color: 'bg-info'
        },
        {
            title: 'User Account Activity',
            description: 'Summary of administrative and system user status and verification.',
            icon: UserCheck,
            path: '/reports/users',
            color: 'bg-warning'
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <h2 className="text-2xl font-bold">System Reports</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report, index) => (
                    <ReportCard key={index} {...report} />
                ))}
            </div>
        </div>
    );
};

export default ReportsIndex;
