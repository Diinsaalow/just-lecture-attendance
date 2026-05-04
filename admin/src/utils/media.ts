import { IMediaItem } from '../types/media';

export const getFileIcon = (item: IMediaItem): string => {
    if (item.isFolder) {
        // Different icon for collection folders
        return item.isCollection ? '🎬' : '📁';
    }

    const mimeType = item.mimeType || '';
    const extension = item.extension || '';

    // Image files
    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        return '🖼️';
    }

    // Video files
    if (mimeType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
        return '🎥';
    }

    // Audio files
    if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
        return '🎵';
    }

    // Document files
    if (mimeType.includes('pdf') || ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
        return '📄';
    }

    // Archive files
    if (mimeType.includes('zip') || mimeType.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return '📦';
    }

    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(extension)) {
        return '💻';
    }

    return '📄';
};

export const getFileType = (item: IMediaItem): string => {
    if (item.isFolder) {
        // Different type for collection folders
        return item.isCollection ? 'Collection' : 'Folder';
    }

    const mimeType = item.mimeType || '';
    const extension = item.extension || '';

    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive';
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(extension)) {
        return 'Code';
    }

    return 'Document';
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const isPreviewable = (item: IMediaItem): boolean => {
    if (item.isFolder) return false;

    const mimeType = item.mimeType || '';
    const extension = item.extension || '';

    // Images
    if (mimeType.startsWith('image/')) return true;

    // Videos
    if (mimeType.startsWith('video/')) return true;

    // PDFs
    if (mimeType.includes('pdf')) return true;

    // Text files
    if (mimeType.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts'].includes(extension)) {
        return true;
    }

    return false;
};

export const shouldDownload = (item: IMediaItem): boolean => {
    return !isPreviewable(item) && !item.isFolder;
};
