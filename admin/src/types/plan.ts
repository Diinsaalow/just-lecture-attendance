export interface IPlan {
    _id: string;
    name: string;
    description: string;
    duration: number;
    durationType: 'days' | 'weeks' | 'months' | 'years';
    originalPrice: number;
    salePrice: number;
    currency: {
        name: string;
        symbol: string;
    };
    status: 'active' | 'inactive' | 'archived';
    createdBy: string | { _id: string; firstName: string; lastName: string; email: string };
    createdAt: string;
    updatedAt: string;
}

export interface ICreatePlan {
    name: string;
    description: string;
    duration: number;
    durationType: 'days' | 'weeks' | 'months' | 'years';
    originalPrice: number;
    salePrice: number;
    currency: {
        name: string;
        symbol: string;
    };
    status?: 'active' | 'inactive' | 'archived';
}

export interface IUpdatePlan {
    name?: string;
    description?: string;
    duration?: number;
    durationType?: 'days' | 'weeks' | 'months' | 'years';
    originalPrice?: number;
    salePrice?: number;
    currency?: {
        type: string;
        symbol: string;
    };
    status?: 'active' | 'inactive' | 'archived';
}

export interface IPlanFilters {
    status?: 'active' | 'inactive' | 'archived';
    durationType?: 'days' | 'weeks' | 'months' | 'years';
    createdBy?: string;
}

export interface IPlanSearchParams {
    searchTerm: string;
    filters?: IPlanFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface IPlanStats {
    totalPlans: number;
    activePlans: number;
    inactivePlans: number;
    archivedPlans: number;
}
