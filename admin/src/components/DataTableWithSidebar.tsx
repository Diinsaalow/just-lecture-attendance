import React from 'react';
import { ColumnConfig } from '../types/columns';
import { IPopulate, IQueryParams } from '../types/api';
import CustomDataTable from './datatable';
import DetailSidebar from './DetailSidebar';

interface DataTableWithSidebarProps<T> {
    title: string;
    columns: ColumnConfig<T>[];
    fetchData: (param: IQueryParams) => any; // RTK Query hook
    searchFields: string[];
    sortCol?: string;
    query?: Record<string, any>;
    /** Top-level API query param (e.g. `variant=staff` on GET /users). */
    variant?: IQueryParams['variant'];
    populate?: IPopulate[];
    rowSelectionEnabled?: boolean;
    onSelectionChange?: (records: T[]) => void;
    searchable?: boolean;
    exportable?: {
        enabled: boolean;
        name: string;
        formats?: ('csv' | 'excel' | 'pdf')[];
    };
    columnToggle?: boolean;
    className?: string;
    bulkActions?: Array<{
        label: string;
        icon: React.ReactNode;
        color: string;
        onClick: (ids: any[]) => void;
    }>;
    buttons?: React.ReactNode;
    showSidebar: boolean;
    sidebarTitle: string;
    onCloseSidebar: () => void;
    sidebarContent: React.ReactNode;
    onRowClick?: (row: T) => void;
    getRecordId?: (record: T) => number;
    idAccessor?: string;
}

const DataTableWithSidebar = <T,>({
    title,
    columns,
    fetchData,
    searchFields,
    sortCol = 'created_at',
    query = {},
    variant,
    populate = [],
    rowSelectionEnabled = true,
    onSelectionChange,
    searchable = true,
    exportable,
    columnToggle = true,
    className = 'mt-5',
    bulkActions,
    buttons,
    showSidebar,
    sidebarTitle,
    onCloseSidebar,
    sidebarContent,
    onRowClick,
    getRecordId,
    idAccessor = '_id',
}: DataTableWithSidebarProps<T>) => {
    return (
        <div className="flex transition-all duration-300 ease-in-out">
            <div className={`${showSidebar ? 'w-1/2 pr-4' : 'w-full'} transition-all duration-300 ease-in-out`}>
                <CustomDataTable
                    title={title}
                    columns={columns}
                    fetchData={fetchData}
                    searchFields={searchFields}
                    sortCol={sortCol}
                    query={query}
                    variant={variant}
                    populate={populate}
                    rowSelectionEnabled={rowSelectionEnabled}
                    onSelectionChange={onSelectionChange}
                    searchable={searchable}
                    exportable={exportable}
                    columnToggle={columnToggle}
                    className={className}
                    bulkActions={bulkActions}
                    buttons={buttons}
                    onRowClick={onRowClick}
                    getRecordId={getRecordId}
                    idAccessor={idAccessor}
                />

            </div>

            <DetailSidebar isVisible={showSidebar} title={sidebarTitle} onClose={onCloseSidebar} className={className}>
                {sidebarContent}
            </DetailSidebar>
        </div>
    );
};

export default DataTableWithSidebar;
