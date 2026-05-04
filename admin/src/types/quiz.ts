export type QuizType = 'subject' | 'chapter' | 'lesson';

export interface IQuizSettings {
    maxAttempts: number;
    timeLimit: number; // minutes, 0 = no limit
    passingScore: number; // percentage
    autoGrade: boolean;
    requirePassing: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
}

// Keep in sync with server/src/quiz/enums/question.enum.ts
export type QuestionType = 'mcq' | 'tf';

export interface IQuestion {
    _id?: string;
    quiz?: string;
    order?: number;
    type: QuestionType;
    question: string;
    image?: string | null;
    options?: string[];
    correctAnswers?: string[]; // aligns with backend schema
    explanation?: string | null;
    marks: number;
    createdBy?:
        | string
        | {
              _id: string;
              firstName: string;
              lastName: string;
              fullName: string;
              id: string;
          };
    createdAt?: string;
    updatedAt?: string;
    id?: string;
}

export interface IQuiz {
    _id: string;
    title: string;
    description?: string;
    type: QuizType;
    subject?: string;
    chapter?: string;
    lesson?: string;
    level?: string;
    curriculum?: string;
    order?: number;
    difficulty?: string;
    maxAttempts?: number;
    totalMarks?: number;
    passingScore?: number;
    showResults?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    status?: 'active' | 'inactive';
    createdBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        fullName: string;
        id: string;
    };
    questions?: IQuestion[];
    createdAt?: string;
    updatedAt?: string;
    id: string;
}

export interface CreateQuizDto {
    title: string;
    description?: string;
    type: QuizType;
    subject?: string;
    chapter?: string;
    lesson?: string;
    level?: string;
    curriculum?: string;
    settings: IQuizSettings;
    questions?: Array<Pick<IQuestion, 'question' | 'type' | 'marks' | 'options' | 'correctAnswers' | 'explanation' | 'order'>>;
    isActive: boolean;
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {}

export interface CreateQuestionDto {
    question: string;
    type: QuestionType;
    marks: number;
    options?: string[];
    correctAnswers: string[];
    explanation?: string;
    order?: number;
}
