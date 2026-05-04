import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './FormQuill.css';

interface FormQuillProps {
    label: string;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    className?: string;
}

const FormQuill: React.FC<FormQuillProps> = ({ label, error, value, onChange, onBlur, disabled = false, placeholder = '', rows = 5, className = '' }) => {
    // Check if ReactQuill is available
    if (typeof ReactQuill === 'undefined') {
        // Fallback to textarea if ReactQuill is not available
        return (
            <div className="space-y-2">
                <label className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{label} (Fallback: Rich text editor not available)</label>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={placeholder}
                    rows={rows}
                    className={`
                        block w-full px-4 py-2.5 text-gray-900 dark:text-white
                        border-2 rounded-lg text-sm transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-primary/20
                        dark:bg-black/30
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-primary dark:border-gray-700'}
                        ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                        ${className}
                    `}
                />
                {error && (
                    <p className="text-sm text-red-500 mt-1" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    }

    // Quill modules configuration
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
            ['link', 'image', 'video'],
        ],
    };

    // Quill editor formats
    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'video',
        'color',
        'background',
        'align',
        'direction',
        'script',
        'clean',
    ];

    return (
        <div className="space-y-2">
            <label className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{label}</label>
            <div className={`${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} border-2 rounded-lg overflow-hidden`}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={disabled}
                    className={`
                        ${disabled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-black/30'}
                        ${className}
                    `}
                    style={{
                        height: `${rows * 1.5}rem`,
                        minHeight: `${rows * 1.5}rem`,
                    }}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormQuill;
