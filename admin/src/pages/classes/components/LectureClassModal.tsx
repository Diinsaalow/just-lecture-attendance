import React from 'react';
import GenericSidebar from '../../../components/GenericSidebar';
import type { ILectureClass } from '../../../types/lectureClass';
import LectureClassForm from './LectureClassForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: ILectureClass | null;
}

const LectureClassModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title={itemToEdit ? 'Edit Class' : 'New Class'}
        width="min(100vw, 42rem)"
        closeButtonPosition="top-right"
    >
        <LectureClassForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericSidebar>
);

export default LectureClassModal;
