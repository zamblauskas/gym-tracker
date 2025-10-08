import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { DrawerMode } from '@/lib/constants'

export interface DrawerParams {
  id?: string
  exerciseTypeId?: string
  [key: string]: string | undefined
}

/**
 * Unified hook for managing URL-based drawer state with proper history handling
 *
 * Usage:
 * ```tsx
 * const { isOpen, drawerMode, openDrawer, closeDrawer } = useDrawer()
 *
 * // Open drawer (replaces current history entry)
 * openDrawer('createExerciseType')
 * openDrawer('editExerciseType', { id: '123' })
 *
 * // Close drawer (replaces current history entry)
 * closeDrawer()
 * ```
 *
 * History behavior:
 * - Opening drawer: navigate(url, { replace: true }) → replaces current entry
 * - Closing drawer: navigate(baseUrl, { replace: true }) → replaces current entry
 * - Result: Drawers never create history entries, back button navigates to previous page
 */
export function useDrawer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  // Get current drawer state from URL
  const drawerMode = searchParams.get('drawer') as DrawerMode | null
  const isOpen = !!drawerMode

  // Get all drawer-related params
  const getDrawerParams = (): DrawerParams => {
    const params: DrawerParams = {}
    searchParams.forEach((value, key) => {
      if (key !== 'drawer') {
        params[key] = value
      }
    })
    return params
  }

  /**
   * Opens a drawer by adding query params to current URL
   * Uses replace: true to avoid creating new history entries
   * This ensures drawers don't pollute browser history
   */
  const openDrawer = (mode: DrawerMode, params?: DrawerParams) => {
    const searchParamsObj = new URLSearchParams()
    searchParamsObj.set('drawer', mode)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParamsObj.set(key, value)
        }
      })
    }

    navigate(`${location.pathname}?${searchParamsObj.toString()}`, { replace: true })
  }

  /**
   * Closes the drawer by navigating to base path WITHOUT drawer params
   * Uses replace: true to replace current history entry
   * This prevents back button from reopening the drawer
   */
  const closeDrawer = () => {
    navigate(location.pathname, { replace: true })
  }

  return {
    isOpen,
    drawerMode,
    drawerParams: getDrawerParams(),
    openDrawer,
    closeDrawer,
  }
}
