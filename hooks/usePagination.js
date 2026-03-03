import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Custom hook for URL-synced pagination
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.defaultPage - Default page number (default: 1)
 * @param {number} options.defaultLimit - Default items per page (default: 25)
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = ({ defaultPage = 1, defaultLimit = 25 } = {}) => {
    const router = useRouter();

    const [pagination, setPagination] = useState({
        page: parseInt(router.query.page) || defaultPage,
        limit: parseInt(router.query.limit) || defaultLimit,
    });

    // Sync pagination with URL query params
    useEffect(() => {
        const pageFromUrl = parseInt(router.query.page) || defaultPage;
        const limitFromUrl = parseInt(router.query.limit) || defaultLimit;

        setPagination({ page: pageFromUrl, limit: limitFromUrl });
    }, [router.query.page, router.query.limit, defaultPage, defaultLimit]);

    /**
     * Reset pagination to page 1 and sync with URL
     * @param {boolean} preserveQueryParams - Whether to preserve other query params
     * @returns {Object} Reset pagination object
     */
    const resetToPageOne = (preserveQueryParams = true) => {
        const resetPagination = { ...pagination, page: defaultPage };
        setPagination(resetPagination);

        router.push(
            {
                pathname: router.pathname,
                query: preserveQueryParams
                    ? { ...router.query, page: defaultPage, limit: pagination.limit }
                    : { page: defaultPage, limit: pagination.limit },
            },
            undefined,
            { shallow: true }
        );

        return resetPagination;
    };

    /**
     * Handle page change and sync with URL
     * @param {number} newPage - New page number
     */
    const handlePageChange = (newPage) => {
        const newPagination = { ...pagination, page: newPage };
        setPagination(newPagination);

        // Update URL query params
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page: newPage, limit: pagination.limit },
            },
            undefined,
            { shallow: true }
        );
    };

    return {
        pagination,
        setPagination,
        resetToPageOne,
        handlePageChange,
    };
};
