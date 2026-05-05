import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { ICourse } from '../../../types/course';
import CourseForm from './CourseForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: ICourse | null;
}

const CourseModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Course' : 'New Course'} maxWidth="2xl">
        <CourseForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default CourseModal;
