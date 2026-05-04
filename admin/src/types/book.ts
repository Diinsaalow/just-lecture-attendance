export interface IBook {
    _id: string;
    title: string;
    slug: string;
    subject: string | { _id: string; name: string; class: { _id: string; name: string } };
    class: string | { _id: string; name: string; level: { _id: string; name: string } };
    curriculum: string | { _id: string; name: string; code: string };
    description?: string;
    thumbnail?: string | { _id: string; url: string; name: string; type: string };
    file?: string | { _id: string; url: string; name: string; type: string };
    pages: number;
    language: string;
    isFree: boolean;
    isFeatured: boolean;
    averageRating: number;
    totalReview: number;
    status: 'active' | 'inactive';
    createdBy?: string | { _id: string; firstName: string; lastName: string; fullName: string; id: string };
    createdAt: string;
    updatedAt: string;
}

export interface ICreateBook {
    title: string;
    slug: string;
    subject: string;
    class: string;
    curriculum: string;
    description?: string;
    thumbnail?: string;
    file?: string;
    pages?: number;
    language: string;
    isFree?: boolean;
    isFeatured?: boolean;
}

export interface IUpdateBook {
    title?: string;
    slug?: string;
    subject?: string;
    class?: string;
    curriculum?: string;
    description?: string;
    thumbnail?: string;
    file?: string;
    pages?: number;
    language?: string;
    isFree?: boolean;
    isFeatured?: boolean;
}
