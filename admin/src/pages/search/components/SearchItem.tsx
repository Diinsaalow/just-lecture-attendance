import { Book, BookOpen, ClipboardList, Clock, CreditCard, FileText, HelpCircle, Search, Star, Tag, User, UserCheck } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { EntityType, IGlobalSearchItem } from '../../../types/global-search';

interface SearchItemProps {
    item: IGlobalSearchItem;
}

const getIconForType = (type: EntityType) => {
    const iconMap = {
        curriculum: BookOpen,
        level: ClipboardList,
        class: BookOpen,
        subject: BookOpen,
        chapter: FileText,
        lesson: FileText,
        book: Book,
        quiz: HelpCircle,
        'national-examination': ClipboardList,
        user: User,
        review: Star,
        plan: CreditCard,
        enrollment: UserCheck,
    };

    const IconComponent = iconMap[type] || Search;
    return <IconComponent className="w-5 h-5 text-blue-500" />;
};

const getFormattedDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
};

const getTypeLabel = (type: EntityType) => {
    const labelMap = {
        curriculum: 'Curriculum',
        level: 'Level',
        class: 'Class',
        subject: 'Subject',
        chapter: 'Chapter',
        lesson: 'Lesson',
        book: 'Book',
        quiz: 'Quiz',
        'national-examination': 'National Examination',
        user: 'User',
        review: 'Review',
        plan: 'Plan',
        enrollment: 'Enrollment',
    };

    return labelMap[type] || type.replace('-', ' ');
};

const getAdditionalInfo = (item: IGlobalSearchItem) => {
    const { additional_data } = item;
    if (!additional_data) return null;

    switch (item.type as EntityType) {
        case 'book':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.subject && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Tag className="w-3 h-3 mr-1" />
                            {additional_data.subject}
                        </span>
                    )}
                    {additional_data.class && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{additional_data.class}</span>
                    )}
                    {additional_data.isFree && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Free</span>}
                    {additional_data.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Featured</span>
                    )}
                </div>
            );
        case 'user':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{additional_data.role}</span>
                    )}
                    {additional_data.status && (
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                additional_data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                            {additional_data.status}
                        </span>
                    )}
                </div>
            );
        case 'review':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.book && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Book className="w-3 h-3 mr-1" />
                            {additional_data.book}
                        </span>
                    )}
                    {additional_data.rating && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            <Star className="w-3 h-3 mr-1" />
                            {additional_data.rating}
                        </span>
                    )}
                </div>
            );
        case 'plan':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.price && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            {additional_data.currency}${additional_data.price}
                        </span>
                    )}
                    {additional_data.duration && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.duration} days</span>
                    )}
                    {additional_data.isPopular && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Popular</span>
                    )}
                </div>
            );
        case 'curriculum':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.code && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.code}</span>
                    )}
                    {additional_data.status && (
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                additional_data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                            {additional_data.status}
                        </span>
                    )}
                </div>
            );
        case 'subject':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.class && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.class}</span>
                    )}
                    {additional_data.level && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{additional_data.level}</span>
                    )}
                </div>
            );
        case 'chapter':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.subject && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.subject}</span>
                    )}
                    {additional_data.order && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Order: {additional_data.order}</span>
                    )}
                </div>
            );
        case 'lesson':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.chapter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.chapter}</span>
                    )}
                    {additional_data.subject && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{additional_data.subject}</span>
                    )}
                </div>
            );
        case 'quiz':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.chapter && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{additional_data.chapter}</span>
                    )}
                    {additional_data.type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{additional_data.type}</span>
                    )}
                </div>
            );
        case 'enrollment':
            return (
                <div className="flex items-center gap-2 mt-1">
                    {additional_data.user && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <User className="w-3 h-3 mr-1" />
                            {additional_data.user}
                        </span>
                    )}
                    {additional_data.plan && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{additional_data.plan}</span>
                    )}
                    {additional_data.status && (
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                additional_data.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                        >
                            {additional_data.status}
                        </span>
                    )}
                </div>
            );
        default:
            return null;
    }
};

const SearchItem: React.FC<SearchItemProps> = ({ item }) => {
    return (
        <Link to={item.url} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200" key={`${item.type}-${item.id}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIconForType(item.type as EntityType)}</div>
                <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</h3>
                    {item.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>}
                    {getAdditionalInfo(item)}
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{getTypeLabel(item.type as EntityType)}</span>
                        {item.created_at && (
                            <>
                                <span className="mx-2">•</span>
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{getFormattedDate(item.created_at)}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default SearchItem;
