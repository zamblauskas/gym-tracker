import { motion } from 'framer-motion'
import { StickyNote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface ExerciseNotesProps {
  notes: string
  onNotesChange: (notes: string) => void
  onBlur: () => void
}

export function ExerciseNotes({ notes, onNotesChange, onBlur }: ExerciseNotesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
          <h3 className="text-sm font-medium">Notes</h3>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onBlur}
          placeholder="e.g., Increase weight, Form felt great, etc."
          className="min-h-[80px]"
        />
      </Card>
    </motion.div>
  )
}
