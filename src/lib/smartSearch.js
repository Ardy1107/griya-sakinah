/**
 * Smart Search Utility with Fuzzy Matching
 * Uses Fuse.js for typo-tolerant search
 */

import Fuse from 'fuse.js';

/**
 * Create a fuzzy search on an array of items
 * @param {Array} items - Array of objects to search
 * @param {Array} keys - Array of keys to search in (e.g., ['name', 'blok', 'phone'])
 * @param {string} query - Search query string
 * @param {Object} options - Optional Fuse.js options override
 * @returns {Array} Filtered items matching the query
 */
export function createFuzzySearch(items, keys, query, options = {}) {
    if (!query || query.trim() === '') {
        return items;
    }

    const defaultOptions = {
        keys: keys,
        threshold: 0.4, // 0 = exact match, 1 = match anything
        distance: 100,  // How close the match must be to the fuzzy location
        includeScore: true,
        ignoreLocation: true, // Search anywhere in the string
        minMatchCharLength: 2,
        ...options
    };

    const fuse = new Fuse(items, defaultOptions);
    const results = fuse.search(query.trim());

    // Return just the items (without score metadata)
    return results.map(result => result.item);
}

/**
 * Create a fuzzy search with score information
 * Useful for highlighting or showing relevance
 */
export function createFuzzySearchWithScore(items, keys, query, options = {}) {
    if (!query || query.trim() === '') {
        return items.map(item => ({ item, score: 0 }));
    }

    const defaultOptions = {
        keys: keys,
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
        ...options
    };

    const fuse = new Fuse(items, defaultOptions);
    return fuse.search(query.trim());
}
export default createFuzzySearch;
