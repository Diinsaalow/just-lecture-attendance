import moment from 'moment';
import { useMemo, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import {
    useGetAttendanceTimelineQuery,
    useGetDashboardSummaryQuery,
    useGetFacultyBreakdownQuery,
} from '../../store/api/lectureReportsApi';
import { useGetAllFacultiesQuery } from '../../store/api/facultyApi';
import type { ILectureReportFilter } from '../../types/lectureReports';

const STATUSES = [
    'PRESENT',
    'LATE',
    'ABSENT',
    'EXCUSED',
    'EARLY_CHECKOUT',
    'MISSED_CHECKOUT',
    'CHECKED_IN',
];

const ReportsPage = () => {
    const [filters, setFilters] = useState<ILectureReportFilter>({});
    const { data: faculties } = useGetAllFacultiesQuery({
        query: {},
        options: { limit: 200, page: 1 },
    });

    const { data: summary, isLoading: summaryLoading } = useGetDashboardSummaryQuery(filters);
    const { data: timeline, isLoading: timelineLoading } = useGetAttendanceTimelineQuery(filters);
    const { data: facultyBreakdown, isLoading: facultyLoading } = useGetFacultyBreakdownQuery(filters);

    /** Pivot timeline data: { [date]: { [status]: count } } */
    const timelineRows = useMemo(() => {
        const rows: Record<string, Record<string, number>> = {};
        (timeline ?? []).forEach((entry) => {
            const date = entry._id.date;
            if (!rows[date]) rows[date] = {};
            rows[date][entry._id.status] = entry.count;
        });
        return Object.entries(rows)
            .sort(([a], [b]) => a.localeCompare(b))
            .reverse();
    }, [timeline]);

    const facultyRows = useMemo(() => {
        const rows: Record<string, Record<string, number>> = {};
        (facultyBreakdown ?? []).forEach((entry) => {
            const fid = entry._id.facultyId || 'Unknown';
            if (!rows[fid]) rows[fid] = {};
            rows[fid][entry._id.status] = entry.count;
        });
        return rows;
    }, [facultyBreakdown]);

    const facultyName = (id: string) => {
        const f = (faculties?.docs ?? []).find((x) => x._id === id);
        return f?.name ?? id;
    };

    const onChange = <K extends keyof ILectureReportFilter>(
        key: K,
        value: ILectureReportFilter[K],
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    };

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Reports' }]} />

            <div className="panel mt-5">
                <h3 className="text-lg font-semibold mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-semibold">From</label>
                        <input
                            type="date"
                            className="form-input mt-1 w-full"
                            value={filters.from ?? ''}
                            onChange={(e) => onChange('from', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">To</label>
                        <input
                            type="date"
                            className="form-input mt-1 w-full"
                            value={filters.to ?? ''}
                            onChange={(e) => onChange('to', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Faculty</label>
                        <select
                            className="form-select mt-1 w-full"
                            value={filters.facultyId ?? ''}
                            onChange={(e) => onChange('facultyId', e.target.value || undefined)}
                        >
                            <option value="">All faculties</option>
                            {(faculties?.docs ?? []).map((f) => (
                                <option key={f._id} value={f._id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setFilters({})}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            <div className="panel mt-5">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                {summaryLoading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Sessions</p>
                            <p className="text-xl font-semibold">{summary?.totalSessions ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Records</p>
                            <p className="text-xl font-semibold">{summary?.totalAttendance ?? 0}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Pending submissions</p>
                            <p className="text-xl font-semibold">
                                {summary?.pendingSubmissions ?? 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500">On-time</p>
                            <p className="text-xl font-semibold">
                                {(summary?.percentages?.present ?? 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="panel mt-5">
                <h3 className="text-lg font-semibold mb-4">Daily attendance breakdown</h3>
                {timelineLoading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : timelineRows.length === 0 ? (
                    <p className="text-gray-500">No data for the selected range.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {STATUSES.map((s) => (
                                        <th key={s}>{s}</th>
                                    ))}
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timelineRows.map(([date, rowMap]) => {
                                    const total = Object.values(rowMap).reduce(
                                        (a, b) => a + b,
                                        0,
                                    );
                                    return (
                                        <tr key={date}>
                                            <td>{moment(date).format('MMM DD, YYYY')}</td>
                                            {STATUSES.map((s) => (
                                                <td key={s}>{rowMap[s] ?? 0}</td>
                                            ))}
                                            <td className="font-semibold">{total}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="panel mt-5 mb-5">
                <h3 className="text-lg font-semibold mb-4">Faculty breakdown</h3>
                {facultyLoading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : Object.keys(facultyRows).length === 0 ? (
                    <p className="text-gray-500">No data.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Faculty</th>
                                    {STATUSES.map((s) => (
                                        <th key={s}>{s}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(facultyRows).map(([fid, rowMap]) => (
                                    <tr key={fid}>
                                        <td>{facultyName(fid)}</td>
                                        {STATUSES.map((s) => (
                                            <td key={s}>{rowMap[s] ?? 0}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
