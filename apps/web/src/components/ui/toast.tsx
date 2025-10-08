import { useErrors } from '@/contexts/ErrorContext'
import { Button } from './button'
import { Z_INDEX } from '@/lib/constants'

export function Toast() {
  const { errors, clearError } = useErrors()

  if (errors.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-md" style={{ '--z-toast': Z_INDEX.TOAST } as React.CSSProperties}>
      {errors.map((error) => (
        <div
          key={error.id}
          className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-start justify-between gap-3 animate-in slide-in-from-right"
        >
          <div className="flex-1">
            <p className="font-semibold">{error.message}</p>
            {error.details && (
              <p className="text-sm opacity-90 mt-1">{error.details}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearError(error.id)}
            className="text-white hover:bg-red-600 h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  )
}
