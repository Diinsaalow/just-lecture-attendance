import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLazySearchEntityTypeGetQuery, useSearchGetQuery } from '../../store/api/globalSearchApi';
import { EntityType, IGlobalSearchItem } from '../../types/global-search';
import ErrorMessage from './components/ErrorMessage';
import SearchResultsHeader from './components/SearchResultsHeader';
import SearchResultsSkeleton from './components/SearchResultsSkeleton';
import SearchResultsTabs from './components/SearchResultsTabs';

type PaginationState = {
    [key: string]: {
        page: number;
        hasMore: boolean;
        items: IGlobalSearchItem[];
    };
};

const SearchResults: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const activeTab = searchParams.get('type') || 'all';

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [paginationState, setPaginationState] = useState<PaginationState>({});

    // Use the GET query for initial search
    const { data: searchResults, isLoading, error } = useSearchGetQuery({ q: query, limit_per_type: 10 }, { skip: !query });

    // Lazy query for loading more results
    const [searchEntityType] = useLazySearchEntityTypeGetQuery();

    // Initialize pagination state when search results change
    useEffect(() => {
        if (searchResults) {
            const newPaginationState: PaginationState = {};

            // Initialize pagination state for each entity type
            Object.keys(searchResults.results).forEach((entityType) => {
                const items = searchResults.results[entityType] || [];
                const total = searchResults.total_per_category[entityType] || 0;

                newPaginationState[entityType] = {
                    page: 1,
                    hasMore: total > items.length,
                    items: items,
                };
            });

            setPaginationState(newPaginationState);
        }
    }, [searchResults]);

    const handleTabChange = (tab: string) => {
        // Update the URL when tab changes while preserving the search query
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            if (tab === 'all') {
                newParams.delete('type');
            } else {
                newParams.set('type', tab);
            }
            return newParams;
        });
    };

    const loadMoreResults = async (type: string) => {
        if (!query || isLoadingMore || !paginationState[type]?.hasMore) return;

        setIsLoadingMore(true);
        try {
            const nextPage = paginationState[type].page + 1;
            const response = await searchEntityType({
                entityType: type as EntityType,
                params: {
                    q: query,
                    page: nextPage,
                    per_page: 15,
                },
            }).unwrap();

            setPaginationState((prev) => ({
                ...prev,
                [type]: {
                    page: nextPage,
                    hasMore: response.meta.next_page_url !== null,
                    items: [...prev[type].items, ...response.data],
                },
            }));
        } catch (err) {
            console.error(`Error loading more ${type}:`, err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    if (!query) {
        return (
            <div className="p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Search</h1>
                        <p className="text-gray-600 dark:text-gray-400">Enter a search term to find content across the platform.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" ">
            <div className="max-w-7xl mx-auto">
                <SearchResultsHeader query={query} searchResults={searchResults || null} />

                {isLoading ? (
                    <SearchResultsSkeleton />
                ) : error ? (
                    <ErrorMessage message="Failed to fetch search results. Please try again later." />
                ) : searchResults ? (
                    <SearchResultsTabs
                        activeTab={activeTab}
                        searchResults={searchResults}
                        query={query}
                        paginationState={paginationState}
                        isLoadingMore={isLoadingMore}
                        onTabChange={handleTabChange}
                        onLoadMore={loadMoreResults}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default SearchResults;
