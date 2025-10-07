import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { DrawerMode } from '@/lib/constants'

export interface DrawerParams {
  id?: string
  exerciseTypeId?: string
  [key: string]: string | undefined
}

/**
 * Unified hook for managing URL-based drawer state with smart back button UX
 *
 * Usage:
 * ```tsx
 * const { isOpen, drawerMode, openDrawer, closeDrawer } = useDrawer()
 *
 * // Open drawer (pushes to history)
 * openDrawer('createExerciseType')
 * openDrawer('editExerciseType', { id: '123' })
 *
 * // Close drawer (replaces history to prevent back button reopening)
 * closeDrawer()
 * ```
 *
 * History behavior:
 * - Opening drawer: navigate(url) → pushes to history
 * - Closing drawer: navigate(baseUrl, { replace: true }) → replaces current entry
 * - Result: Back button skips closed drawer and goes to previous page
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
   * Pushes new entry to browser history
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

    navigate(`${location.pathname}?${searchParamsObj.toString()}`)
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
