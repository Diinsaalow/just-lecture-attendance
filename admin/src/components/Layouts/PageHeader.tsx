import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => (
    <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle ? <p className="text-white-dark mt-1">{subtitle}</p> : null}
        </div>
    </div>
);

export default PageHeader;
