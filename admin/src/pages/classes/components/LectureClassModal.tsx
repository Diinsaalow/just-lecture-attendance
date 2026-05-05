import React from 'react';
import GenericModal from '../../../components/GenericModal';
import type { ILectureClass } from '../../../types/lectureClass';
import LectureClassForm from './LectureClassForm';

interface Props {
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    itemToEdit?: ILectureClass | null;
}

const LectureClassModal: React.FC<Props> = ({ isOpen, setIsOpen, itemToEdit }) => (
    <GenericModal isOpen={isOpen} setIsOpen={setIsOpen} title={itemToEdit ? 'Edit Class' : 'New Class'} maxWidth="2xl">
        <LectureClassForm itemToEdit={itemToEdit} onClose={() => setIsOpen(false)} />
    </GenericModal>
);

export default LectureClassModal;
