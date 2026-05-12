import moment from 'moment';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumb from '../../components/Breadcrumb';
import DataTableWithSidebar from '../../components/DataTableWithSidebar';
import { useSidebarDetail } from '../../hooks/useSidebarDetail';
import {
    useGetAllSubmissionsQuery,
    useApproveSubmissionMutation,
    useRejectSubmissionMutation,
} from '../../store/api/submissionApi';
import type { ColumnConfig } from '../../types/columns';
import type {
    IAbsenceSubmission,
    SubmissionStatus,
    SubmissionType,
} from '../../types/submission';
import SubmissionDetail from './components/SubmissionDetail';
import SubmissionReviewModal from './components/SubmissionReviewModal';

const TYPE_LABELS: Record<SubmissionType, string> = {
    ABSENCE: 'Absence',
    LATE_ARRIVAL: 'Late arrival',
    EARLY_LEAVE: 'Early leave',
};

const STATUS_BADGE: Record<SubmissionStatus, string> = {
    PENDING: 'badge-outline-warning',
    APPROVED: 'badge-outline-success',
    REJECTED: 'badge-outline-danger',
    EXCUSED: 'badge-outline-info',
};

function instructorLabel(ref: IAbsenceSubmission['instructorUserId']): string {
    if (!ref || typeof ref !== 'object') return '-';
    const u = ref as { firstName?: string; lastName?: string; username?: string };
    const full = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return full || u.username || '-';
}

function sessionLabel(ref: IAbsenceSubmission['sessionId']): string {
    if (!ref || typeof ref !== 'object') return '-';
    const s = ref as {
        scheduledDate?: string;
        fromTime?: string;
        toTime?: string;
        classId?: { name?: string };
        courseId?: { name?: string };
    };
    const date = s.scheduledDate ? moment(s.scheduledDate).format('MMM DD, YYYY') : '';
    const time = s.fromTime && s.toTime ? `${s.fromTime}–${s.toTime}` : '';
    const cls = s.classId?.name ?? '';
    const course = s.courseId?.name ?? '';
    return [date, time, cls, course].filter(Boolean).join(' · ') || '-';
}

const SubmissionsPage = () => {
    const { selectedId, showSidebar, openSidebar, closeSidebar } = useSidebarDetail();
    const [reviewState, setReviewState] = useState<{
        id: string;
        action: 'approve' | 'reject';
    } | null>(null);

    const [approve, { isLoading: approving }] = useApproveSubmissionMutation();
    const [reject, { isLoading: rejecting }] = useRejectSubmissionMutation();

    const submit = async (note: string) => {
        if (!reviewState) return;
        try {
            const fn = reviewState.action === 'approve' ? approve : reject;
            await fn({ id: reviewState.id, data: { note: note || undefined } }).unwrap();
            toast.success(
                reviewState.action === 'approve' ? 'Submission approved' : 'Submission rejected',
            );
            setReviewState(null);
        } catch (e: unknown) {
            toast.error(
                (e as { data?: { message?: string } })?.data?.message ?? 'Action failed',
            );
        }
    };

    const columns: ColumnConfig<IAbsenceSubmission>[] = [
        {
            accessor: 'instructorUserId',
            title: 'Instructor',
            type: 'text',
            sortable: false,
            render: (r) => <span>{instructorLabel(r.instructorUserId)}</span>,
        },
        {
            accessor: 'sessionId',
            title: 'Session',
            type: 'text',
            sortable: false,
            render: (r) => <span>{sessionLabel(r.sessionId)}</span>,
        },
        {
            accessor: 'type',
            title: 'Type',
            type: 'text',
            sortable: true,
            render: (r) => <span>{TYPE_LABELS[r.type]}</span>,
        },
        { accessor: 'reason', title: 'Reason', type: 'text', sortable: false },
        {
            accessor: 'status',
            title: 'Status',
            type: 'text',
            sortable: true,
            render: (r) => (
                <span className={`badge ${STATUS_BADGE[r.status] ?? 'badge-outline-secondary'}`}>
                    {r.status}
                </span>
            ),
        },
        {
            accessor: 'createdAt',
            title: 'Submitted',
            type: 'date',
            sortable: true,
            render: ({ createdAt }) => (
                <span>{createdAt ? moment(createdAt).format('MMM DD, YYYY HH:mm') : '-'}</span>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            type: 'actions',
            sortable: false,
            textAlignment: 'center',
            actions: [
                { type: 'view', onClick: (r) => openSidebar(r._id) },
                {
                    type: 'custom',
                    label: 'Approve',
                    tooltip: 'Approve submission',
                    icon: <Check size={18} className="text-success" />,
                    onClick: (r) => setReviewState({ id: r._id, action: 'approve' }),
                    show: (r: IAbsenceSubmission) => r.status === 'PENDING',
                },
                {
                    type: 'custom',
                    label: 'Reject',
                    tooltip: 'Reject submission',
                    icon: <X size={18} className="text-danger" />,
                    onClick: (r) => setReviewState({ id: r._id, action: 'reject' }),
                    show: (r: IAbsenceSubmission) => r.status === 'PENDING',
                },
            ],
        },
    ];

    return (
        <div>
            <Breadcrumb items={[{ title: 'Dashboard', path: '/' }, { title: 'Submissions' }]} />
            <DataTableWithSidebar<IAbsenceSubmission>
                title="Absence / Late / Early Submissions"
                columns={columns}
                fetchData={useGetAllSubmissionsQuery}
                searchFields={['reason', 'description', 'status', 'type']}
                sortCol="createdAt"
                className="mt-5"
                query={{}}
                idAccessor="_id"
                rowSelectionEnabled={false}
                showSidebar={showSidebar}
                sidebarTitle="Submission Details"
                onCloseSidebar={closeSidebar}
                sidebarContent={<SubmissionDetail submissionId={selectedId} />}
            />
            <SubmissionReviewModal
                open={!!reviewState}
                action={reviewState?.action ?? 'approve'}
                loading={approving || rejecting}
                onClose={() => setReviewState(null)}
                onSubmit={submit}
            />
        </div>
    );
};

export default SubmissionsPage;
