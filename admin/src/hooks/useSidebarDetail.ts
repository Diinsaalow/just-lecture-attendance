import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseSidebarDetailOptions {
    paramName?: string;
}

export function useSidebarDetail({ paramName = 'view' }: UseSidebarDetailOptions = {}) {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL parameter
    const initialId = searchParams.get(paramName);
    const [selectedId, setSelectedId] = useState<string | null>(initialId);
    const [showSidebar, setShowSidebar] = useState(Boolean(initialId));

    const openSidebar = (id: string) => {
        setSelectedId(id);
        setShowSidebar(true);
        // Update URL with ID
        searchParams.set(paramName, id);
        setSearchParams(searchParams);
    };

    const closeSidebar = () => {
        setShowSidebar(false);
        setSelectedId(null);
        // Remove view parameter from URL
        searchParams.delete(paramName);
        setSearchParams(searchParams);
    };

    // Effect to sync URL params with component state
    useEffect(() => {
        const viewParam = searchParams.get(paramName);
        if (viewParam && !selectedId) {
            setSelectedId(viewParam);
            setShowSidebar(true);
        } else if (!viewParam && selectedId) {
            // URL parameter was removed externally
            setSelectedId(null);
            setShowSidebar(false);
        }
    }, [searchParams, selectedId, paramName]);

    return {
        selectedId,
        showSidebar,
        openSidebar,
        closeSidebar,
    };
}

export default useSidebarDetail;
