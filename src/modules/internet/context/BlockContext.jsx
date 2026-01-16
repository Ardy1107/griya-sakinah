// Block Context - Manages current block state (A or B)
import { createContext, useContext, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const BlockContext = createContext(null)

// Extract block ID from URL path
// /blok-a/internet/* -> 'A'
// /blok-b/internet/* -> 'B'
// /internet/* (superadmin) -> null (sees all)
function extractBlockFromPath(pathname) {
    const match = pathname.match(/\/blok-([ab])\/internet/i)
    if (match) {
        return match[1].toUpperCase()
    }
    return null // Superadmin mode or invalid
}

export function BlockProvider({ children }) {
    const location = useLocation()
    const { blockId: paramBlockId } = useParams()

    const value = useMemo(() => {
        // First try from URL params, then from path
        let blockId = paramBlockId?.toUpperCase() || extractBlockFromPath(location.pathname)

        // Validate block ID
        if (blockId && !['A', 'B'].includes(blockId)) {
            blockId = null
        }

        return {
            blockId,
            blockName: blockId ? `Blok ${blockId}` : 'Semua Blok',
            isBlockSpecific: !!blockId,
            isSuperadminMode: !blockId,

            // Helper to filter residents by block
            filterByBlock: (items, blockField = 'blok_rumah') => {
                if (!blockId) return items // Superadmin sees all
                return items.filter(item => {
                    const value = item[blockField] || ''
                    return value.toUpperCase().startsWith(blockId)
                })
            },

            // Get block ID from resident's blok_rumah
            getBlockFromResident: (resident) => {
                if (!resident?.blok_rumah) return null
                const firstChar = resident.blok_rumah.charAt(0).toUpperCase()
                return ['A', 'B'].includes(firstChar) ? firstChar : null
            },

            // Check if a resident belongs to current block
            belongsToCurrentBlock: (resident) => {
                if (!blockId) return true // Superadmin sees all
                if (!resident?.blok_rumah) return false
                return resident.blok_rumah.toUpperCase().startsWith(blockId)
            },

            // URL prefix for current block
            urlPrefix: blockId ? `/blok-${blockId.toLowerCase()}/internet` : '/internet'
        }
    }, [location.pathname, paramBlockId])

    return (
        <BlockContext.Provider value={value}>
            {children}
        </BlockContext.Provider>
    )
}

export function useBlock() {
    const context = useContext(BlockContext)
    if (!context) {
        // Return default context if not wrapped (for backwards compatibility)
        return {
            blockId: null,
            blockName: 'Semua Blok',
            isBlockSpecific: false,
            isSuperadminMode: true,
            filterByBlock: (items) => items,
            getBlockFromResident: () => null,
            belongsToCurrentBlock: () => true,
            urlPrefix: '/internet'
        }
    }
    return context
}

export default BlockContext
