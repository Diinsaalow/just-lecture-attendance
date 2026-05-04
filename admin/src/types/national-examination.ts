export interface INationalExamination {
    _id: string;
    title: string;
    slug: string;
    description?: string;
    curriculum: string | { _id: string; name: string; code: string };
    level: string | { _id: string; name: string; curriculum: { _id: string; name: string } };
    class: string | { _id: string; name: string; level: { _id: string; name: string } };
    subject: string | { _id: string; name: string; class: { _id: string; name: string } };
    file?: string | { _id: string; url: string; name: string; type: string };
    isFree: boolean;
    examYear?: string;
    status: 'active' | 'inactive';
    createdBy?: string | { _id: string; firstName: string; lastName: string; fullName: string; id: string };
    createdAt: string;
    updatedAt: string;
}

export interface ICreateNationalExamination {
    title: string;
    slug: string;
    description?: string;
    curriculum?: string; // Optional since it will be set from context
    level: string;
    class: string;
    subject: string;
    file?: string;
    isFree?: boolean;
    examYear?: string;
    status?: 'active' | 'inactive';
}

export interface IUpdateNationalExamination {
    title?: string;
    slug?: string;
    description?: string;
    curriculum?: string; // Optional since it will be set from context
    level?: string;
    class?: string;
    subject?: string;
    file?: string;
    isFree?: boolean;
    examYear?: string;
    status?: 'active' | 'inactive';
}
