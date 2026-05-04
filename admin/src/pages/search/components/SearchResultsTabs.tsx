import { ArrowRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { ENTITY_LABELS, EntityType, IGlobalSearchItem, IGlobalSearchResponse } from '../../../types/global-search';
import LoadMoreButton from './LoadMoreButton';
import NoResults from './NoResults';
import SearchItem from './SearchItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

interface SearchResultsTabsProps {
    activeTab: string;
    searchResults: IGlobalSearchResponse;
    query: string;
    paginationState: {
        [key: string]: {
            page: number;
            hasMore: boolean;
            items: IGlobalSearchItem[];
        };
    };
    isLoadingMore: boolean;
    onTabChange: (tab: string) => void;
    onLoadMore: (type: string) => void;
}

const entityTypes: EntityType[] = ['curriculum', 'level', 'class', 'subject', 'chapter', 'lesson', 'book', 'quiz', 'national-examination', 'user', 'review', 'plan', 'enrollment'];

const SearchResultsTabs: React.FC<SearchResultsTabsProps> = ({ activeTab, searchResults, query, paginationState, isLoadingMore, onTabChange, onLoadMore }) => {
    const createViewAllLink = (type: string) => `/search?q=${encodeURIComponent(query)}&type=${type}`;

    const renderEntitySection = (type: EntityType, items: IGlobalSearchItem[]) => (
        <div className="mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
                <h2 className="font-medium text-gray-900 dark:text-white">{ENTITY_LABELS[type]}</h2>
                <Link to={createViewAllLink(type)} className="text-primary text-sm flex items-center hover:text-primary-dark transition-colors duration-200">
                    View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
            {items.map((item: IGlobalSearchItem) => (
                <SearchItem key={`${item.type}-${item.id}`} item={item} />
            ))}
        </div>
    );

    const renderTabContent = (type: string) => {
        if (type === 'all') {
            return (
                <>
                    {searchResults.results.curriculum?.length > 0 && renderEntitySection('curriculum', searchResults.results.curriculum)}
                    {searchResults.results.level?.length > 0 && renderEntitySection('level', searchResults.results.level)}
                    {searchResults.results.class?.length > 0 && renderEntitySection('class', searchResults.results.class)}
                    {searchResults.results.subject?.length > 0 && renderEntitySection('subject', searchResults.results.subject)}
                    {searchResults.results.chapter?.length > 0 && renderEntitySection('chapter', searchResults.results.chapter)}
                    {searchResults.results.lesson?.length > 0 && renderEntitySection('lesson', searchResults.results.lesson)}
                    {searchResults.results.book?.length > 0 && renderEntitySection('book', searchResults.results.book)}
                    {searchResults.results.quiz?.length > 0 && renderEntitySection('quiz', searchResults.results.quiz)}
                    {searchResults.results['national-examination']?.length > 0 && renderEntitySection('national-examination', searchResults.results['national-examination'])}
                    {searchResults.results.user?.length > 0 && renderEntitySection('user', searchResults.results.user)}
                    {searchResults.results.review?.length > 0 && renderEntitySection('review', searchResults.results.review)}
                    {searchResults.results.plan?.length > 0 && renderEntitySection('plan', searchResults.results.plan)}
                    {searchResults.results.enrollment?.length > 0 && renderEntitySection('enrollment', searchResults.results.enrollment)}
                </>
            );
        }

        const items = paginationState[type]?.items || [];
        const hasMore = paginationState[type]?.hasMore || false;
        const isEmpty = items.length === 0;

        if (isEmpty) {
            return <NoResults query={query} />;
        }

        return (
            <>
                {items.map((item: IGlobalSearchItem) => (
                    <SearchItem key={`${item.type}-${item.id}`} item={item} />
                ))}
                {hasMore && <LoadMoreButton isLoading={isLoadingMore} onClick={() => onLoadMore(type)} />}
            </>
        );
    };

    // Filter entity types to only show those with count > 0
    const entityTypesWithResults = entityTypes.filter((type) => (searchResults?.total_per_category[type] || 0) > 0);

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <TabsTrigger value="all" className="whitespace-nowrap">
                    All ({searchResults?.total_results || 0})
                </TabsTrigger>
                {entityTypesWithResults.map((type) => (
                    <TabsTrigger key={type} value={type} className="whitespace-nowrap">
                        {ENTITY_LABELS[type]} ({searchResults?.total_per_category[type] || 0})
                    </TabsTrigger>
                ))}
            </TabsList>

            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <TabsContent value="all" className="min-h-[400px]">
                    {searchResults.total_results === 0 ? <NoResults query={query} /> : renderTabContent('all')}
                </TabsContent>

                {entityTypesWithResults.map((type) => (
                    <TabsContent key={type} value={type} className="min-h-[400px]">
                        {renderTabContent(type)}
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    );
};

export default SearchResultsTabs;
