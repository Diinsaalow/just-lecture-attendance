import { Image as ImageIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ImageUploadProps {
    id: string;
    label: string;
    value: File | null;
    onChange: (file: File | null) => void;
    error?: string | null;
    required?: boolean;
    maxSize?: number;
    disabled?: boolean;
    helpText?: string;
    placeholder?: string;
    previewUrl?: string | null;
    accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
    maxSize = 5120, // Default 5MB
    disabled = false,
    helpText = "JPG, PNG, GIF (Max 5MB)",
    placeholder = "Drop your image here or click to browse",
    previewUrl = null,
    accept = "image/*"
}) => {
    const [preview, setPreview] = useState<string | null>(previewUrl);

    useEffect(() => {
        // When file value changes, update preview
        if (value) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(value);
        } else if (previewUrl) {
            // If there's no file but there is a previewUrl, use that
            setPreview(previewUrl);
        } else {
            // Neither file nor previewUrl, clear preview
            setPreview(null);
        }
    }, [value, previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            onChange(file);
        }
    };

    const handleDelete = () => {
        onChange(null);
        setPreview(null);

        // Reset the file input by clearing its value
        const fileInput = document.getElementById(id) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    // Format file size to readable format (KB or MB)
    const formatFileSize = (bytes: number) => {
        const kb = bytes / 1024;
        if (kb < 1024) {
            return `${Math.round(kb)} KB`;
        } else {
            return `${(kb / 1024).toFixed(2)} MB`;
        }
    };

    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className={`border border-gray-300 rounded-md p-4 ${error ? 'border-red-500' : ''}`}>
                {preview ? (
                    <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium">Image Preview</p>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-700"
                                disabled={disabled}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="relative w-32 h-44 mx-auto border border-gray-200 rounded overflow-hidden">
                            <img
                                src={preview}
                                alt="Image Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {value && (
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                {value.name} ({formatFileSize(value.size)})
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex flex-col items-center justify-center py-6">
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                                {placeholder}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{helpText}</p>
                            <input
                                id={id}
                                type="file"
                                accept={accept}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default ImageUpload;
