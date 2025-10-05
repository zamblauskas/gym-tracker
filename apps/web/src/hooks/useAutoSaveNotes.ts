import { useEffect, useRef } from 'react'

interface UseAutoSaveNotesProps {
  notes: string
  onSave: () => void
  enabled: boolean
  debounceMs?: number
}

/**
 * Hook for auto-saving notes with debouncing
 * @param notes - Current notes value
 * @param onSave - Callback to save notes
 * @param enabled - Whether auto-save is enabled
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 */
export function useAutoSaveNotes({
  notes,
  onSave,
  enabled,
  debounceMs = 500
}: UseAutoSaveNotesProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout to save after debounce period
    timeoutRef.current = setTimeout(() => {
      onSave()
    }, debounceMs)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [notes, onSave, enabled, debounceMs])
}
