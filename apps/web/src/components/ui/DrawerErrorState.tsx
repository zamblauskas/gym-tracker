import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface DrawerErrorStateProps {
  message: string
  onClose: () => void
}

/**
 * Error state component for drawers when entity lookup fails
 * Provides user-friendly error message and close button
 */
export function DrawerErrorState({ message, onClose }: DrawerErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold mb-2">Unable to Load Content</h3>

      <p className="text-[hsl(var(--color-muted-foreground))] mb-6 max-w-sm">
        {message}
      </p>

      <Button onClick={onClose} variant="outline" size="lg" className="min-w-[120px]">
        Close
      </Button>
    </div>
  )
}
