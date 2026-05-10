import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ActionButton from '../../../components/ActionButton';
import FormSelect from '../../../components/form/FormSelect';
import FormTimePicker from '../../../components/form/FormTimePicker';
import { ENTITY_STATUS_OPTIONS, PERIOD_TYPE_OPTIONS } from '../../../constants/entityStatus';
import { useCreatePeriodMutation, useUpdatePeriodMutation } from '../../../store/api/periodApi';
import { useGetAllLectureClassesQuery } from '../../../store/api/lectureClassApi';
import { useGetAllCoursesQuery } from '../../../store/api/courseApi';
import { useGetAllSemestersQuery } from '../../../store/api/semesterApi';
import { useGetAllDepartmentsQuery } from '../../../store/api/departmentApi';
import { useGetAllLecturersQuery } from '../../../store/api/lecturerApi';
import { useGetAllHallsQuery } from '../../../store/api/hallApi';
import type { IUser } from '../../../types/auth';
import type { ICourse } from '../../../types/course';
import type { IHall } from '../../../types/hall';
import type { ILectureClass } from '../../../types/lectureClass';
import type { IPeriod } from '../../../types/period';
import { formatJamhuriyaUsername } from '../../../utils/jamhuriyaUsername';

const WEEKDAY_OPTIONS = (
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
).map((d) => ({ value: d, label: d }));

function lecturerSelectLabel(u: IUser): string {
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    const uname = u.username ? formatJamhuriyaUsername(u.username) : '';
    if (full && uname) return `${full} (${uname})`;
    if (full) return full;
    if (uname) return `(${uname})`;
    return u.email || u._id;
}

function normalizeWeekday(day: string): string {
    const t = day.trim();
    const match = WEEKDAY_OPTIONS.find((o) => o.value.toLowerCase() === t.toLowerCase());
    return match?.value ?? t;
}

/** Ensures Flatpickr gets stable `HH:mm` (pads single-digit hours). */
function normalizeTimeHHmm(t: string): string {
    const s = t.trim();
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return s;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (isNaN(h) || isNaN(min)) return s;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function departmentIdOfClass(c: ILectureClass): string {
    const d = c.departmentId;
    return typeof d === 'string' ? d : d._id;
}

function departmentIdOfCourse(c: ICourse): string {
    const d = c.departmentId;
    return typeof d === 'string' ? d : d._id;
}

function campusIdOfClass(c: ILectureClass): string {
    const x = c.campusId;
    if (!x) return '';
    return typeof x === 'string' ? x : x._id || '';
}

function campusIdOfHall(h: IHall): string {
    const x = h.campusId;
    if (!x) return '';
    return typeof x === 'string' ? x : x._id || '';
}

function hallIdOfPeriod(p: IPeriod): string {
    if (!p.hallId) return '';
    return typeof p.hallId === 'string' ? p.hallId : p.hallId._id || '';
}

const schema = z.object({
    departmentId: z.string().min(1, 'Department is required'),
    classId: z.string().min(1, 'Class is required'),
    courseId: z.string().min(1, 'Course is required'),
    lecturerId: z.string().min(1, 'Lecturer is required'),
    semesterId: z.string().min(1, 'Semester is required'),
    day: z.string().min(1, 'Day is required'),
    type: z.enum(['Lab', 'Theory']),
    from: z.string().min(1, 'From is required'),
    to: z.string().min(1, 'To is required'),
    hallId: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
    itemToEdit?: IPeriod | null;
    onClose: () => void;
}

const PeriodForm: React.FC<Props> = ({ itemToEdit, onClose }) => {
    const isEdit = Boolean(itemToEdit);
    const { data: lcRes } = useGetAllLectureClassesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: coRes } = useGetAllCoursesQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: seRes } = useGetAllSemestersQuery({ query: {}, options: { limit: 200, page: 1 } });
    const { data: depRes } = useGetAllDepartmentsQuery({ query: {}, options: { limit: 200, page: 1 } });
    const { data: lecRes } = useGetAllLecturersQuery({ query: {}, options: { limit: 500, page: 1 } });
    const { data: hallRes } = useGetAllHallsQuery({ query: {}, options: { limit: 500, page: 1 } });

    const deptOpts = useMemo(() => (depRes?.docs ?? []).map((d) => ({ value: d._id, label: d.name })), [depRes]);
    const semOpts = useMemo(() => (seRes?.docs ?? []).map((s) => ({ value: s._id, label: s.name })), [seRes]);
    const lecturerOpts = useMemo(
        () => (lecRes?.docs ?? []).map((u) => ({ value: u._id, label: lecturerSelectLabel(u) })),
        [lecRes],
    );

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            departmentId: '',
            classId: '',
            courseId: '',
            lecturerId: '',
            semesterId: '',
            day: '',
            type: 'Theory',
            from: '',
            to: '',
            hallId: '',
            status: 'ACTIVE',
        },
    });

    const departmentId = watch('departmentId');
    const classId = watch('classId');

    const selectedClass = useMemo(
        () => (classId ? (lcRes?.docs ?? []).find((c) => c._id === classId) : undefined),
        [lcRes, classId],
    );

    const classCampusId = selectedClass ? campusIdOfClass(selectedClass) : '';

    const hallOpts = useMemo(() => {
        return (hallRes?.docs ?? [])
            .filter((h) => !classCampusId || campusIdOfHall(h) === classCampusId)
            .map((h) => {
                const code = h.code ? ` (${h.code})` : '';
                return { value: h._id, label: `${h.name}${code}` };
            });
    }, [hallRes, classCampusId]);

    const classOpts = useMemo(() => {
        if (!departmentId) return [];
        return (lcRes?.docs ?? [])
            .filter((c) => departmentIdOfClass(c) === departmentId)
            .map((c) => ({ value: c._id, label: c.name }));
    }, [lcRes, departmentId]);

    const courseOpts = useMemo(() => {
        if (!departmentId) return [];
        return (coRes?.docs ?? [])
            .filter((c) => departmentIdOfCourse(c) === departmentId)
            .map((c) => ({ value: c._id, label: c.name }));
    }, [coRes, departmentId]);

    const [createItem] = useCreatePeriodMutation();
    const [updateItem] = useUpdatePeriodMutation();

    useEffect(() => {
        if (itemToEdit) {
            const extractId = (val: any) => {
                if (!val) return '';
                if (typeof val === 'string') return val;
                return val._id || '';
            };

            const classId = extractId(itemToEdit.classId);
            const courseIdVal = extractId(itemToEdit.courseId);
            const cls = lcRes?.docs?.find((c) => c._id === classId);
            const crs = coRes?.docs?.find((c) => c._id === courseIdVal);
            const resolvedDept = cls ? departmentIdOfClass(cls) : crs ? departmentIdOfCourse(crs) : '';
            reset({
                departmentId: resolvedDept,
                classId,
                courseId: courseIdVal,
                lecturerId: extractId(itemToEdit.lecturerId),
                semesterId: extractId(itemToEdit.semesterId),
                day: itemToEdit.day ? normalizeWeekday(itemToEdit.day) : '',
                type: itemToEdit.type,
                from: itemToEdit.from ? normalizeTimeHHmm(itemToEdit.from) : '',
                to: itemToEdit.to ? normalizeTimeHHmm(itemToEdit.to) : '',
                hallId: hallIdOfPeriod(itemToEdit),
                status: itemToEdit.status,
            });
        } else {
            reset({
                departmentId: '',
                classId: '',
                courseId: '',
                lecturerId: '',
                semesterId: '',
                day: '',
                type: 'Theory',
                from: '',
                to: '',
                hallId: '',
                status: 'ACTIVE',
            });
        }
    }, [itemToEdit, lcRes?.docs, coRes?.docs, reset]);

    const onSubmit = async (data: FormData) => {
        const { departmentId: _d, ...rest } = data;
        const payload: Record<string, unknown> = { ...rest };
        if (!payload.hallId) {
            if (isEdit) payload.hallId = null;
            else delete payload.hallId;
        }
        try {
            if (isEdit && itemToEdit) {
                await updateItem({ id: itemToEdit._id, data: payload }).unwrap();
                toast.success('Period updated');
            } else {
                await createItem(payload).unwrap();
                toast.success('Period created');
            }
            onClose();
            reset();
        } catch (error: unknown) {
            toast.error((error as { data?: { message?: string } })?.data?.message || 'Failed');
        }
    };

    const deptLocked = isSubmitting;

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="departmentId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-dept"
                        label="Department"
                        value={value || ''}
                        onChange={(v) => {
                            onChange(v);
                            setValue('classId', '');
                            setValue('courseId', '');
                        }}
                        onBlur={onBlur}
                        options={deptOpts}
                        error={errors.departmentId?.message}
                        disabled={deptLocked}
                    />
                )}
            />
            <Controller
                name="classId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-class"
                        label="Class"
                        value={value}
                        onChange={(v) => {
                            onChange(v);
                            setValue('hallId', '');
                        }}
                        onBlur={onBlur}
                        options={classOpts}
                        error={errors.classId?.message}
                        disabled={deptLocked || !departmentId}
                    />
                )}
            />
            <Controller
                name="courseId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-course"
                        label="Course"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={courseOpts}
                        error={errors.courseId?.message}
                        disabled={deptLocked || !departmentId}
                    />
                )}
            />
            <Controller
                name="hallId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-hall"
                        label="Hall (optional)"
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={[{ value: '', label: '—' }, ...hallOpts]}
                        error={errors.hallId?.message}
                        disabled={isSubmitting || !classId}
                    />
                )}
            />
            <Controller
                name="lecturerId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-lec"
                        label="Lecturer"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={lecturerOpts}
                        error={errors.lecturerId?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="semesterId"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-sem" label="Semester" value={value} onChange={onChange} onBlur={onBlur} options={semOpts} error={errors.semesterId?.message} disabled={isSubmitting} />
                )}
            />
            <Controller
                name="day"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect
                        id="p-day"
                        label="Day"
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        options={WEEKDAY_OPTIONS}
                        error={errors.day?.message}
                        disabled={isSubmitting}
                    />
                )}
            />
            <Controller
                name="type"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-type" label="Type" value={value} onChange={onChange} onBlur={onBlur} options={PERIOD_TYPE_OPTIONS} disabled={isSubmitting} error={errors.type?.message} />
                )}
            />
            <Controller
                name="from"
                control={control}
                render={({ field }) => (
                    <FormTimePicker
                        id="p-from"
                        label="From"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.from?.message}
                        disabled={isSubmitting}
                        placeholder="Select start time"
                    />
                )}
            />
            <Controller
                name="to"
                control={control}
                render={({ field }) => (
                    <FormTimePicker
                        id="p-to"
                        label="To"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.to?.message}
                        disabled={isSubmitting}
                        placeholder="Select end time"
                    />
                )}
            />
            <Controller
                name="status"
                control={control}
                render={({ field: { value, onChange, onBlur } }) => (
                    <FormSelect id="p-st" label="Status" value={value || 'ACTIVE'} onChange={onChange} onBlur={onBlur} options={ENTITY_STATUS_OPTIONS} disabled={isSubmitting} />
                )}
            />
            <div className="flex justify-end mt-6">
                <ActionButton type="button" variant="outline-danger" onClick={onClose} displayText="Cancel" disabled={isSubmitting} />
                <ActionButton type="submit" variant="primary" isLoading={isSubmitting} displayText={isEdit ? 'Update' : 'Save'} className="ltr:ml-4 rtl:mr-4" />
            </div>
        </form>
    );
};

export default PeriodForm;
