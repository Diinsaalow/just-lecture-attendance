import React, { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, Check } from 'lucide-react';
import { useGetAllCurriculumsQuery } from '../../store/api/curriculumApi';
import { useCurriculum } from '../../contexts/CurriculumContext';
import { ICurriculum } from '../../types/curriculum';

interface QuickLinksProps {
    onOpenModal: () => void;
}

const QuickLinks = ({ onOpenModal }: QuickLinksProps) => {
    const [isOpen, setIsOpen] = useState(false);
    // const { selectedCurriculum, setSelectedCurriculum } = useCurriculum();

    // const { data: curriculumsData, isLoading } = useGetAllCurriculumsQuery({
    //     search: { keyword: '', fields: ['name', 'code', 'status'] },
    //     options: { limit: 50, page: 1, sort: { createdAt: 'desc' } },
    // });

    // const curriculums = curriculumsData?.docs || [];

    // // Auto-select first curriculum if none is selected and curriculums are loaded
    // useEffect(() => {
    //     if (curriculums.length > 0 && !selectedCurriculum) {
    //         // Try to load from localStorage first
    //         const savedCurriculumId = localStorage.getItem('selectedCurriculumId');
    //         if (savedCurriculumId) {
    //             const savedCurriculum = curriculums.find((c) => c._id === savedCurriculumId);
    //             if (savedCurriculum) {
    //                 setSelectedCurriculum(savedCurriculum);
    //                 return;
    //             }
    //         }
    //         // If no saved curriculum or saved curriculum not found, select the first one
    //         setSelectedCurriculum(curriculums[0]);
    //     }
    // }, [curriculums, selectedCurriculum, setSelectedCurriculum]);

    // const handleCurriculumSelect = (curriculum: ICurriculum) => {
    //     setSelectedCurriculum(curriculum);
    //     // Save to localStorage
    //     localStorage.setItem('selectedCurriculumId', curriculum._id);
    //     setIsOpen(false);
    // };

    // const handleClearSelection = () => {
    //     setSelectedCurriculum(null);
    //     // Remove from localStorage
    //     localStorage.removeItem('selectedCurriculumId');
    //     setIsOpen(false);
    // };

    return (
        <div className="ltr:mr-2 rtl:ml-2 hidden sm:block">
            {/* <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white-light/40 dark:bg-gray-700/60 hover:text-primary hover:bg-white-light/90 dark:hover:bg-gray-600/80 rounded-lg transition-colors min-w-[200px] max-w-[300px] border border-gray-200 dark:border-gray-500"
                >
                    <BookOpen className="w-4 h-4 text-primary dark:text-primary flex-shrink-0" />
                    <span className="flex-1 text-left truncate">
                        {selectedCurriculum ? (
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{selectedCurriculum.name}</div>
                            </div>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Select Curriculum</span>
                        )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg dark:shadow-gray-900/50 z-50 max-h-80 overflow-y-auto w-[280px] min-w-[280px]">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                <p className="mt-2 text-sm">Loading curriculums...</p>
                            </div>
                        ) : curriculums.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm">No curriculums found</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleClearSelection}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors font-medium"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                                <div className="py-1">
                                    {curriculums.map((curriculum) => (
                                        <button
                                            key={curriculum._id}
                                            onClick={() => handleCurriculumSelect(curriculum)}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{curriculum.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{curriculum.code}</div>
                                            </div>
                                            {selectedCurriculum?._id === curriculum._id && <Check className="w-4 h-4 text-primary dark:text-primary flex-shrink-0 ml-2" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div> */}
        </div>
    );
};

export default QuickLinks;
