import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit, ChevronRight, ScrollText } from 'lucide-react'
import { Program } from '../types/program'
import { Routine } from '../types/routine'
import { ExerciseType } from '../types/exerciseType'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Drawer } from 'vaul'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useState } from 'react'

interface ProgramDetailProps {
  program: Program
  routines: Routine[]
  exerciseTypes: ExerciseType[]
  availableRoutines: Routine[]
  onAddRoutine: (routineId: string) => void
  onRemoveRoutine: (routineId: string) => void
  onDelete: (programId: string) => void
  onEdit: () => void
  onSelectRoutine?: (routine: Routine) => void
}

export default function ProgramDetail({
  program,
  routines,
  exerciseTypes,
  availableRoutines,
  onAddRoutine,
  onRemoveRoutine,
  onDelete,
  onEdit,
  onSelectRoutine
}: ProgramDetailProps) {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const getExerciseTypeNames = (routine: Routine) => {
    return routine.exerciseTypeIds
      .map(id => exerciseTypes.find(et => et.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3) // Show first 3
  }

  const handleAdd = (routineId: string) => {
    onAddRoutine(routineId)
    setSelectorOpen(false)
  }

  const handleConfirmDelete = () => {
    onDelete(program.id)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{program.name}</h1>
            <p className="text-[hsl(var(--color-muted-foreground))] text-sm mt-1">
              {routines.length} {routines.length === 1 ? 'routine' : 'routines'}
            </p>
          </div>
          <Button
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <Button onClick={() => setSelectorOpen(true)} size="lg" className="w-full h-12 gap-2">
          <Plus className="h-5 w-5" />
          Add Routine
        </Button>
      </motion.div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {routines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-12">
                <div className="text-center">
                  <p className="text-[hsl(var(--color-muted-foreground))]">
                    No routines yet. Click "Add Routine" to add one.
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            routines.map((routine, index) => {
              const exerciseTypeNames = getExerciseTypeNames(routine)
              const hasMore = routine.exerciseTypeIds.length > 3

              return (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 24
                  }}
                  layout
                >
                  <Card className="p-4 hover:shadow-lg transition-all group relative overflow-hidden">
                    <div
                      className={`flex items-start justify-between mb-3 ${onSelectRoutine ? 'cursor-pointer' : ''}`}
                      onClick={() => onSelectRoutine?.(routine)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500 bg-opacity-10 flex items-center justify-center">
                            <ScrollText className="h-4 w-4 text-current" />
                          </div>
                          <h3 className="text-lg font-medium">
                            {routine.name}
                          </h3>
                        </div>
                        <p className="text-sm text-[hsl(var(--color-muted-foreground))] ml-10">
                          {routine.exerciseTypeIds.length} exercise {routine.exerciseTypeIds.length === 1 ? 'type' : 'types'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {onSelectRoutine && (
                          <ChevronRight className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover:translate-x-1 transition-transform" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveRoutine(routine.id)
                          }}
                          className="p-2 hover:bg-[hsl(var(--color-destructive))] hover:bg-opacity-10 rounded-lg transition-colors group/remove z-10"
                          aria-label="Remove routine"
                        >
                          <X className="h-5 w-5 text-[hsl(var(--color-muted-foreground))] group-hover/remove:text-[hsl(var(--color-destructive))]" />
                        </button>
                      </div>
                    </div>
                    {onSelectRoutine && (
                      <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                    )}
                    {exerciseTypeNames.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {exerciseTypeNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                        {hasMore && (
                          <Badge variant="outline">
                            +{routine.exerciseTypeIds.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8 pt-8 border-t border-[hsl(var(--color-border))]"
      >
        <Button
          onClick={() => setDeleteConfirmOpen(true)}
          variant="outline"
          size="lg"
          className="w-full h-12 border-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive))] hover:text-[hsl(var(--color-destructive-foreground))]"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Delete Program
        </Button>
      </motion.div>

      {/* Routine Selector Drawer */}
      <Drawer.Root open={selectorOpen} onOpenChange={setSelectorOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-[70%] mt-24 fixed bottom-0 left-0 right-0">
            <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />
              <Drawer.Title className="text-2xl font-bold mb-6">
                Add Routine
              </Drawer.Title>
              <Drawer.Description className="sr-only">
                Select a routine to add to this program
              </Drawer.Description>

              {availableRoutines.length === 0 ? (
                <p className="text-[hsl(var(--color-muted-foreground))] text-center py-8">
                  All routines have been added to this program.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableRoutines.map((routine) => (
                    <button
                      key={routine.id}
                      onClick={() => handleAdd(routine.id)}
                      className="w-full text-left"
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-[hsl(var(--color-accent))]">
                        <h3 className="text-lg font-medium">
                          {routine.name}
                        </h3>
                      </Card>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${program.name}?`}
        description="This will remove the program but keep all routines. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => { }}
        variant="destructive"
      />
    </div>
  )
}
