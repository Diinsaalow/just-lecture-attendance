import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UseSidebarDetailOptions {
    paramName?: string;
}

function isValidEntityId(id: string | null): id is string {
    return Boolean(id && id !== 'undefined');
}

export function useSidebarDetail({ paramName = 'view' }: UseSidebarDetailOptions = {}) {
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedId, setSelectedId] = useState<string | null>(() => {
        const raw = searchParams.get(paramName);
        return isValidEntityId(raw) ? raw : null;
    });
    const [showSidebar, setShowSidebar] = useState(() => {
        const raw = searchParams.get(paramName);
        return isValidEntityId(raw);
    });
    /** True while opening “create” until URL no longer has a stale `view` param. */
    const openingCreateRef = useRef(false);

    const openSidebar = (id?: string | null) => {
        if (id === undefined || id === null || id === '') {
            openingCreateRef.current = true;
            setSelectedId(null);
            setShowSidebar(true);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete(paramName);
                    return next;
                },
                { replace: true }
            );
            return;
        }
        openingCreateRef.current = false;
        setSelectedId(id);
        setShowSidebar(true);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set(paramName, id);
                return next;
            },
            { replace: true }
        );
    };

    const closeSidebar = () => {
        openingCreateRef.current = false;
        setShowSidebar(false);
        setSelectedId(null);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete(paramName);
                return next;
            },
            { replace: true }
        );
    };

    useEffect(() => {
        const raw = searchParams.get(paramName);
        const viewParam = isValidEntityId(raw) ? raw : null;

        if (openingCreateRef.current) {
            if (raw !== null && raw !== '') {
                setSearchParams(
                    (prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete(paramName);
                        return next;
                    },
                    { replace: true }
                );
            } else {
                openingCreateRef.current = false;
            }
            return;
        }

        if (viewParam && viewParam !== selectedId) {
            setSelectedId(viewParam);
            setShowSidebar(true);
        } else if (!viewParam && selectedId) {
            setSelectedId(null);
            setShowSidebar(false);
        }
    }, [searchParams, selectedId, paramName, setSearchParams]);

    return {
        selectedId,
        showSidebar,
        openSidebar,
        closeSidebar,
    };
}

export default useSidebarDetail;
