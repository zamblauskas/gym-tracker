import { Drawer } from 'vaul'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'
import { Z_INDEX } from '@/lib/constants'

interface ConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'destructive'
  showWarningIcon?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'destructive',
  showWarningIcon = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[var(--z-drawer-overlay)]" style={{ '--z-drawer-overlay': Z_INDEX.DRAWER_OVERLAY } as React.CSSProperties} />
        <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-[var(--z-drawer-content)]" style={{ '--z-drawer-content': Z_INDEX.DRAWER_CONTENT } as React.CSSProperties}>
          <div className="p-6 bg-[hsl(var(--color-background))] rounded-t-[10px]">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

            <Drawer.Title className="text-xl font-bold mb-4 flex items-center gap-3">
              {showWarningIcon && (
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--color-destructive))] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--color-destructive))]" />
                </div>
              )}
              {title}
            </Drawer.Title>

            <Drawer.Description className="text-[hsl(var(--color-muted-foreground))] mb-8">
              {description}
            </Drawer.Description>

            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                variant={variant}
                size="lg"
                className="flex-1 h-12"
              >
                {confirmText}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                className="flex-1 h-12"
              >
                {cancelText}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
