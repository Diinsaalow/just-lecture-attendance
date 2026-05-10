import React from 'react';
import GenericSidebar from '../../../components/GenericSidebar';
import { useGetPeriodsByClassQuery } from '../../../store/api/periodApi';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    classId: string | null;
    className?: string;
}

function lecturerLabel(lecturer: any): string {
    if (!lecturer || typeof lecturer !== 'object') return '-';
    const firstName = lecturer.firstName ?? '';
    const lastName = lecturer.lastName ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const username = lecturer.username ?? '';
    if (fullName && username) {
        return `${fullName} (${username.toUpperCase()})`;
    }
    return fullName || (username ? username.toUpperCase() : '-');
}

const ClassPeriodsSidebar: React.FC<Props> = ({ isOpen, setIsOpen, classId, className }) => {
    const { data: periods, isLoading } = useGetPeriodsByClassQuery(classId || '', { skip: !classId || !isOpen });

    return (
        <GenericSidebar
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={`Timetable: ${className || 'Class'}`}
            width="min(100vw, 60rem)"
            closeButtonPosition="top-right"
        >
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <span className="animate-spin border-2 border-primary border-t-transparent rounded-full w-8 h-8"></span>
                </div>
            ) : !periods?.length ? (
                <p className="text-center py-10 text-gray-500">No periods found for this class.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">Day</th>
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">Time</th>
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">Course</th>
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">Lecturer</th>
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200">Hall</th>
                                <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-200 text-center">Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((p) => {
                                const course = typeof p.courseId === 'object' ? (p.courseId as any).name : '-';
                                const hall = typeof p.hallId === 'object' ? (p.hallId as any).name : '-';
                                return (
                                    <tr key={p._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-4 px-3 font-medium text-gray-900 dark:text-gray-100">{p.day}</td>
                                        <td className="py-4 px-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{p.from} - {p.to}</td>
                                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">{course}</td>
                                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">{lecturerLabel(p.lecturerId)}</td>
                                        <td className="py-4 px-3 text-gray-600 dark:text-gray-400">{hall}</td>
                                        <td className="py-4 px-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                p.type === 'Theory' 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                            }`}>
                                                {p.type}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </GenericSidebar>
    );
};

export default ClassPeriodsSidebar;
