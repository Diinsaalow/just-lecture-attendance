import React, { useMemo, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';
import CustomDataTable from './datatable';
import type { ColumnConfig, ActionConfig } from '../types/columns';
import type { IQueryParams, IPopulate } from '../types/api';

function getNested(obj: unknown, path: string): unknown {
    if (obj == null || path === '') return undefined;
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc == null || typeof acc !== 'object') return undefined;
        return (acc as Record<string, unknown>)[key];
    }, obj);
}

export interface SimpleColumn<T> {
    accessor: string;
    title: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}

export interface SimpleAction<T> {
    label: string;
    onClick: (row: T) => void;
}

interface DataTableComponentProps<T extends { _id: string }> {
    columns: SimpleColumn<T>[];
    useQueryHook: (params: IQueryParams) => unknown;
    actions?: SimpleAction<T>[];
    onAdd?: () => void;
    addLabel?: string;
    onBulkDelete?: (selectedRecords: T[]) => void;
    title?: string;
    searchFields?: string[];
    sortCol?: string;
    query?: Record<string, string | number | boolean | string[]>;
    populate?: IPopulate[];
}

function actionTypeForLabel(label: string): ActionConfig['type'] {
    const lower = label.toLowerCase();
    if (lower.includes('delete')) return 'delete';
    return 'edit';
}

function DataTableComponent<T extends { _id: string }>({
    columns: rawColumns,
    useQueryHook,
    actions,
    onAdd,
    addLabel = 'Add',
    onBulkDelete,
    title = 'Records',
    searchFields,
    sortCol = 'createdAt',
    query = {},
    populate,
}: DataTableComponentProps<T>) {
    const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

    const resolvedSearchFields = useMemo(() => {
        if (searchFields?.length) return searchFields;
        return rawColumns.map((c) => c.accessor);
    }, [rawColumns, searchFields]);

    const columnConfigs = useMemo((): ColumnConfig<T>[] => {
        const dataCols: ColumnConfig<T>[] = rawColumns.map((c) => ({
            accessor: c.accessor,
            title: c.title,
            type: 'custom',
            sortable: c.sortable ?? false,
            render: (row: T) => {
                if (c.render) return c.render(row);
                const v = getNested(row, c.accessor);
                return <span>{v != null && v !== '' ? String(v) : '-'}</span>;
            },
        }));

        if (!actions?.length) return dataCols;

        const actionConfigs: ActionConfig<T>[] = actions.map((a) => ({
            type: actionTypeForLabel(a.label),
            label: a.label,
            onClick: a.onClick,
        }));

        return [
            ...dataCols,
            {
                accessor: 'actions',
                title: 'Actions',
                type: 'actions',
                sortable: false,
                textAlignment: 'center',
                actions: actionConfigs,
            },
        ];
    }, [rawColumns, actions]);

    const bulkActions =
        onBulkDelete != null
            ? [
                  {
                      label: 'Delete selected',
                      icon: <IconTrash size={18} />,
                      color: 'red',
                      onClick: () => {
                          onBulkDelete(selectedRecords);
                      },
                  },
              ]
            : [];

    return (
        <CustomDataTable<T>
            title={title}
            columns={columnConfigs}
            fetchData={useQueryHook}
            searchFields={resolvedSearchFields}
            sortCol={sortCol}
            query={query}
            populate={populate}
            rowSelectionEnabled={Boolean(onBulkDelete)}
            onSelectionChange={setSelectedRecords}
            bulkActions={bulkActions}
            idAccessor="_id"
            buttons={
                onAdd ? (
                    <button type="button" className="btn btn-primary gap-2" onClick={onAdd}>
                        {addLabel}
                    </button>
                ) : undefined
            }
        />
    );
}

export default DataTableComponent;
