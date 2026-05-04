export interface IMediaItem {
    _id: string;
    name: string;
    slug: string;
    isFolder: boolean;
    path: string;
    parent: string;
    owner: string;
    visibility: 'private' | 'public';
    sharedWith: string[];
    createdBy: string;
    isRoot: boolean;
    isCollection: boolean;
    collectionId: string | null;
    createdAt: string;
    updatedAt: string;
    // File specific properties
    mimeType?: string;
    extension?: string;
    size?: number;
    url?: string;
    type?: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'ARCHIVE' | 'OTHER';
}

export interface IDirectoryResponse {
    data: {
        parent: IMediaItem;
        children: IMediaItem[];
    };
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}

export interface IMediaQueryParams {
    path?: string;
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortBy?: 'name' | 'size' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}

export interface ICreateDirectoryRequest {
    name: string;
    parent?: string;
    visibility?: 'private' | 'public';
    isCollection?: boolean;
}

export interface IUploadFileRequest {
    file: File;
    parent?: string;
    visibility?: 'private' | 'public';
}

// New types for chunked upload
export interface IChunkedUploadRequest {
    file: File;
    fileId: string;
    chunkNumber: number;
    totalChunks: number;
    originalFilename: string;
    directory: string;
    name: string;
    type: string;
    duration?: number;
}

export interface IChunkedUploadResponse {
    success: boolean;
    message?: string;
    data?: {
        status?: string;
        progress?: number;
        url?: string;
        id?: string;
    };
}

export interface IUploadProgress {
    progress: number;
    status: 'idle' | 'preparing' | 'uploading' | 'completed' | 'error';
}

export interface IChunkedUploadOptions {
    directoryId: string;
    onProgress?: (progress: number, status: string) => void;
    onComplete?: (result: any) => void;
    onError?: (error: string) => void;
}
