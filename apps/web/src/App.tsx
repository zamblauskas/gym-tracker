import { useState, useMemo } from 'react'
import { Drawer } from 'vaul'
import { motion, AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import ExerciseTypeList from './pages/ExerciseTypeList'
import ExerciseList from './pages/ExerciseList'
import ExerciseDetail from './pages/ExerciseDetail'
import RoutineList from './pages/RoutineList'
import RoutineDetail from './pages/RoutineDetail'
import ProgramList from './pages/ProgramList'
import ProgramDetail from './pages/ProgramDetail'
import ActiveWorkout from './pages/ActiveWorkout'
import CreateExerciseType from './pages/CreateExerciseType'
import EditExerciseType from './pages/EditExerciseType'
import CreateExercise from './pages/CreateExercise'
import CreateRoutine from './pages/CreateRoutine'
import EditRoutine from './pages/EditRoutine'
import CreateProgram from './pages/CreateProgram'
import EditProgram from './pages/EditProgram'
import { ExerciseType } from './types/exerciseType'
import { Exercise, CreateExerciseInput } from './types/exercise'
import { Routine, CreateRoutineInput } from './types/routine'
import { Program, CreateProgramInput } from './types/program'
import { WorkoutSession } from './types/workoutSession'
import { usePersistedState } from './hooks/usePersistedState'
import {
  createExerciseTypeRepository,
  createExerciseRepository,
  createRoutineRepository,
  createProgramRepository,
  createWorkoutSessionRepository,
} from './lib/repositories'

type View = 'home' | 'exerciseTypes' | 'exerciseTypeDetail' | 'exerciseDetail' | 'routines' | 'routineDetail' | 'programs' | 'programDetail' | 'activeWorkout'
type DrawerMode = 'exerciseType' | 'editExerciseType' | 'exercise' | 'routine' | 'editRoutine' | 'program' | 'editProgram' | null

function App() {
  // Create repository instances (memoized to avoid recreating on every render)
  const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
  const exerciseRepo = useMemo(() => createExerciseRepository(), [])
  const routineRepo = useMemo(() => createRoutineRepository(), [])
  const programRepo = useMemo(() => createProgramRepository(), [])
  const workoutSessionRepo = useMemo(() => createWorkoutSessionRepository(), [])

  const [currentView, setCurrentView] = useState<View>('home')
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
  const [selectedExerciseType, setSelectedExerciseType] = useState<ExerciseType | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)

  // Navigation context - track where we came from for proper back button behavior
  const [navigationSource, setNavigationSource] = useState<'list' | 'routine' | 'program'>('list')

  // Use persisted state instead of regular useState
  const [exerciseTypes, setExerciseTypes] = usePersistedState<ExerciseType>(exerciseTypeRepo)
  const [exercises, setExercises] = usePersistedState<Exercise>(exerciseRepo)
  const [routines, setRoutines] = usePersistedState<Routine>(routineRepo)
  const [programs, setPrograms] = usePersistedState<Program>(programRepo)
  const [workoutSessions, setWorkoutSessions] = usePersistedState<WorkoutSession>(workoutSessionRepo)

  // Exercise Type handlers
  const handleCreateExerciseType = (name: string) => {
    const newExerciseType: ExerciseType = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('Creating exercise type:', newExerciseType)
    setExerciseTypes([...exerciseTypes, newExerciseType])
    setDrawerMode(null)
  }

  const handleSelectExerciseType = (exerciseType: ExerciseType) => {
    setSelectedExerciseType(exerciseType)
    setNavigationSource('list')
    setCurrentView('exerciseTypeDetail')
  }

  const handleEditExerciseType = (id: string, name: string) => {
    const updatedExerciseType: ExerciseType = {
      ...exerciseTypes.find(et => et.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setExerciseTypes(exerciseTypes.map(et => et.id === id ? updatedExerciseType : et))
    setSelectedExerciseType(updatedExerciseType)
    setDrawerMode(null)
  }

  // Exercise handlers
  const handleCreateExercise = (input: CreateExerciseInput) => {
    const newExercise: Exercise = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('Creating exercise:', newExercise)
    setExercises([...exercises, newExercise])
    setDrawerMode(null)
  }

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setCurrentView('exerciseDetail')
  }

  const handleUpdateExercise = (updatedExercise: Exercise) => {
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex))
    setSelectedExercise(updatedExercise)
  }

  // Routine handlers
  const handleCreateRoutine = (input: CreateRoutineInput) => {
    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('Creating routine:', newRoutine)
    setRoutines([...routines, newRoutine])
    setDrawerMode(null)
  }

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine)
    setCurrentView('routineDetail')
  }

  const handleEditRoutine = (id: string, name: string) => {
    const updatedRoutine: Routine = {
      ...routines.find(r => r.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setRoutines(routines.map(r => r.id === id ? updatedRoutine : r))
    setSelectedRoutine(updatedRoutine)
    setDrawerMode(null)
  }

  const handleAddExerciseTypeToRoutine = (exerciseTypeId: string) => {
    if (!selectedRoutine) return

    const updatedRoutine = {
      ...selectedRoutine,
      exerciseTypeIds: [...selectedRoutine.exerciseTypeIds, exerciseTypeId],
      updatedAt: new Date(),
    }

    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
    setSelectedRoutine(updatedRoutine)
  }

  const handleRemoveExerciseTypeFromRoutine = (exerciseTypeId: string) => {
    if (!selectedRoutine) return

    const updatedRoutine = {
      ...selectedRoutine,
      exerciseTypeIds: selectedRoutine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
      updatedAt: new Date(),
    }

    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
    setSelectedRoutine(updatedRoutine)
  }

  // Program handlers
  const handleCreateProgram = (input: CreateProgramInput) => {
    const newProgram: Program = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('Creating program:', newProgram)
    setPrograms([...programs, newProgram])
    setDrawerMode(null)
  }

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program)
    setCurrentView('programDetail')
  }

  const handleEditProgram = (id: string, name: string) => {
    const updatedProgram: Program = {
      ...programs.find(p => p.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setPrograms(programs.map(p => p.id === id ? updatedProgram : p))
    setSelectedProgram(updatedProgram)
    setDrawerMode(null)
  }

  const handleAddRoutineToProgram = (routineId: string) => {
    if (!selectedProgram) return

    const updatedProgram = {
      ...selectedProgram,
      routineIds: [...selectedProgram.routineIds, routineId],
      updatedAt: new Date(),
    }

    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
    setSelectedProgram(updatedProgram)
  }

  const handleRemoveRoutineFromProgram = (routineId: string) => {
    if (!selectedProgram) return

    const updatedProgram = {
      ...selectedProgram,
      routineIds: selectedProgram.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    }

    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
    setSelectedProgram(updatedProgram)
  }

  // Hierarchical navigation handlers
  const handleSelectRoutineFromProgram = (routine: Routine) => {
    setSelectedRoutine(routine)
    setNavigationSource('program')
    setCurrentView('routineDetail')
  }

  const handleSelectExerciseTypeFromRoutine = (exerciseType: ExerciseType) => {
    setSelectedExerciseType(exerciseType)
    setNavigationSource('routine')
    setCurrentView('exerciseTypeDetail')
  }

  // Deletion handlers
  const handleDeleteExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId))

    // If currently viewing this exercise, navigate back
    if (selectedExercise?.id === exerciseId) {
      setSelectedExercise(null)
      setCurrentView('exerciseTypeDetail')
    }
  }

  const handleDeleteExerciseType = (exerciseTypeId: string) => {
    // Remove exercise type
    setExerciseTypes(exerciseTypes.filter(et => et.id !== exerciseTypeId))

    // CASCADE: Remove all exercises belonging to this exercise type
    setExercises(exercises.filter(ex => ex.exerciseTypeId !== exerciseTypeId))

    // Remove from routines
    setRoutines(routines.map(routine => ({
      ...routine,
      exerciseTypeIds: routine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
      updatedAt: new Date(),
    })))

    // If currently viewing this exercise type, navigate back
    if (selectedExerciseType?.id === exerciseTypeId) {
      setSelectedExerciseType(null)
      setCurrentView('exerciseTypes')
    }
  }

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(routines.filter(r => r.id !== routineId))

    // Remove from programs
    setPrograms(programs.map(program => ({
      ...program,
      routineIds: program.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    })))

    // If currently viewing this routine, navigate back
    if (selectedRoutine?.id === routineId) {
      setSelectedRoutine(null)
      setCurrentView('routines')
    }
  }

  const handleDeleteProgram = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId))

    // If currently viewing this program, navigate back
    if (selectedProgram?.id === programId) {
      setSelectedProgram(null)
      setCurrentView('programs')
    }
  }

  // Navigation handlers
  const handleNavigateToHome = () => {
    setCurrentView('home')
    setSelectedExerciseType(null)
    setSelectedRoutine(null)
    setSelectedProgram(null)
  }

  const handleNavigateToExerciseTypes = () => {
    setCurrentView('exerciseTypes')
  }

  const handleNavigateToRoutines = () => {
    setCurrentView('routines')
  }

  const handleNavigateToPrograms = () => {
    setCurrentView('programs')
  }

  const handleBackFromExerciseTypeDetail = () => {
    setSelectedExerciseType(null)
    if (navigationSource === 'routine') {
      // Return to routine detail if we came from there
      setCurrentView('routineDetail')
    } else {
      // Otherwise return to exercise types list
      setCurrentView('exerciseTypes')
    }
    setNavigationSource('list')
  }

  const handleBackFromExerciseDetail = () => {
    setSelectedExercise(null)
    setCurrentView('exerciseTypeDetail')
  }

  const handleBackFromRoutineDetail = () => {
    setSelectedRoutine(null)
    if (navigationSource === 'program') {
      // Return to program detail if we came from there
      setCurrentView('programDetail')
    } else {
      // Otherwise return to routines list
      setCurrentView('routines')
    }
    setNavigationSource('list')
  }

  const handleBackFromProgramDetail = () => {
    setSelectedProgram(null)
    setCurrentView('programs')
  }

  // Workout session handlers
  const handleStartWorkout = () => {
    if (!nextWorkoutInfo) return

    const newSession: WorkoutSession = {
      id: crypto.randomUUID(),
      programId: nextWorkoutInfo.program?.id,
      routineId: nextWorkoutInfo.routine.id,
      exerciseLogs: [],
      startTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setActiveSession(newSession)
    setSelectedRoutine(nextWorkoutInfo.routine)
    setSelectedProgram(nextWorkoutInfo.program || null)
    setCurrentView('activeWorkout')
  }

  const handleSkipWorkout = () => {
    if (!nextWorkoutInfo) return

    const now = new Date()
    const skippedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      programId: nextWorkoutInfo.program?.id,
      routineId: nextWorkoutInfo.routine.id,
      exerciseLogs: [],
      startTime: now,
      endTime: now,
      duration: 0,
      totalVolume: 0,
      createdAt: now,
      updatedAt: now,
    }

    setWorkoutSessions([...workoutSessions, skippedSession])
  }

  const handleUpdateWorkoutSession = (session: WorkoutSession) => {
    setActiveSession(session)
  }

  const handleFinishWorkout = (finishedSession: WorkoutSession) => {
    setWorkoutSessions([...workoutSessions, finishedSession])
    setActiveSession(null)
    setSelectedRoutine(null)
    setCurrentView('home')
  }

  const handleCancelWorkout = () => {
    setActiveSession(null)
    setSelectedRoutine(null)
    setCurrentView('home')
  }

  // Calculate next workout info (memoized to prevent re-renders)
  const nextWorkoutInfo = useMemo(() => {
    // Find the most recent program with routines
    const activeProgram = programs
      .filter(p => p.routineIds.length > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

    if (!activeProgram) return null

    // Get the program's routines
    const programRoutines = routines.filter(r => activeProgram.routineIds.includes(r.id))
    if (programRoutines.length === 0) return null

    // Find last completed session for this program
    const lastSession = workoutSessions
      .filter(s => s.programId === activeProgram.id && s.endTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    if (!lastSession) {
      // No sessions yet, return first routine
      return { routine: programRoutines[0], program: activeProgram }
    }

    // Find index of last routine in the cycle
    const lastRoutineIndex = activeProgram.routineIds.indexOf(lastSession.routineId)

    // Get next routine in cycle (wrap around if at end)
    const nextRoutineId = activeProgram.routineIds[(lastRoutineIndex + 1) % activeProgram.routineIds.length]
    const nextRoutine = programRoutines.find(r => r.id === nextRoutineId)

    return { routine: nextRoutine || programRoutines[0], program: activeProgram }
  }, [programs, routines, workoutSessions])

  // Computed values
  const filteredExercises = selectedExerciseType
    ? exercises.filter(ex => ex.exerciseTypeId === selectedExerciseType.id)
    : []

  const routineExerciseTypes = selectedRoutine
    ? exerciseTypes.filter(et => selectedRoutine.exerciseTypeIds.includes(et.id))
    : []

  const availableExerciseTypes = selectedRoutine
    ? exerciseTypes.filter(et => !selectedRoutine.exerciseTypeIds.includes(et.id))
    : []

  const programRoutines = selectedProgram
    ? routines.filter(r => selectedProgram.routineIds.includes(r.id))
    : []

  const availableRoutines = selectedProgram
    ? routines.filter(r => !selectedProgram.routineIds.includes(r.id))
    : []

  // Breadcrumb generation
  const programDetailBreadcrumbs = selectedProgram ? [
    { label: 'Home', onClick: () => setCurrentView('home') },
    { label: 'Programs', onClick: () => setCurrentView('programs') },
    { label: selectedProgram.name, onClick: () => { } }
  ] : []

  const routineDetailBreadcrumbs = selectedRoutine ? (
    navigationSource === 'program' && selectedProgram ? [
      { label: 'Home', onClick: () => setCurrentView('home') },
      { label: 'Programs', onClick: () => setCurrentView('programs') },
      { label: selectedProgram.name, onClick: () => setCurrentView('programDetail') },
      { label: selectedRoutine.name, onClick: () => { } }
    ] : [
      { label: 'Home', onClick: () => setCurrentView('home') },
      { label: 'Routines', onClick: () => setCurrentView('routines') },
      { label: selectedRoutine.name, onClick: () => { } }
    ]
  ) : []

  const exerciseTypeDetailBreadcrumbs = selectedExerciseType ? (
    navigationSource === 'routine' && selectedRoutine ?
      (selectedProgram ? [
        { label: 'Home', onClick: () => setCurrentView('home') },
        { label: 'Programs', onClick: () => setCurrentView('programs') },
        { label: selectedProgram.name, onClick: () => setCurrentView('programDetail') },
        { label: selectedRoutine.name, onClick: () => setCurrentView('routineDetail') },
        { label: selectedExerciseType.name, onClick: () => { } }
      ] : [
        { label: 'Home', onClick: () => setCurrentView('home') },
        { label: 'Routines', onClick: () => setCurrentView('routines') },
        { label: selectedRoutine.name, onClick: () => setCurrentView('routineDetail') },
        { label: selectedExerciseType.name, onClick: () => { } }
      ])
      : [
        { label: 'Home', onClick: () => setCurrentView('home') },
        { label: 'Exercise Types', onClick: () => setCurrentView('exerciseTypes') },
        { label: selectedExerciseType.name, onClick: () => { } }
      ]
  ) : []

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Home
              onNavigateToPrograms={handleNavigateToPrograms}
              onNavigateToRoutines={handleNavigateToRoutines}
              onNavigateToExerciseTypes={handleNavigateToExerciseTypes}
              onStartWorkout={handleStartWorkout}
              onSkipWorkout={handleSkipWorkout}
              nextRoutine={nextWorkoutInfo?.routine || null}
              currentProgram={nextWorkoutInfo?.program || null}
            />
          </motion.div>
        )}

        {currentView === 'exerciseTypes' && (
          <motion.div
            key="exerciseTypes"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseTypeList
              exerciseTypes={exerciseTypes}
              exercises={exercises}
              onAdd={() => setDrawerMode('exerciseType')}
              onSelect={handleSelectExerciseType}
              onBack={handleNavigateToHome}
            />
          </motion.div>
        )}

        {currentView === 'exerciseTypeDetail' && selectedExerciseType && (
          <motion.div
            key="exerciseTypeDetail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseList
              exerciseType={selectedExerciseType}
              exercises={filteredExercises}
              onAdd={() => setDrawerMode('exercise')}
              onSelect={handleSelectExercise}
              onDelete={handleDeleteExercise}
              onDeleteExerciseType={handleDeleteExerciseType}
              onEdit={() => setDrawerMode('editExerciseType')}
              onBack={handleBackFromExerciseTypeDetail}
              breadcrumbs={exerciseTypeDetailBreadcrumbs}
            />
          </motion.div>
        )}

        {currentView === 'programs' && (
          <motion.div
            key="programs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ProgramList
              programs={programs}
              routines={routines}
              onAdd={() => setDrawerMode('program')}
              onSelect={handleSelectProgram}
              onBack={handleNavigateToHome}
            />
          </motion.div>
        )}

        {currentView === 'routines' && (
          <motion.div
            key="routines"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RoutineList
              routines={routines}
              exerciseTypes={exerciseTypes}
              onAdd={() => setDrawerMode('routine')}
              onSelect={handleSelectRoutine}
              onBack={handleNavigateToHome}
            />
          </motion.div>
        )}

        {currentView === 'exerciseDetail' && selectedExercise && (
          <motion.div
            key="exerciseDetail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseDetail
              exercise={selectedExercise}
              onUpdate={handleUpdateExercise}
              onDelete={handleDeleteExercise}
              onBack={handleBackFromExerciseDetail}
            />
          </motion.div>
        )}

        {currentView === 'programDetail' && selectedProgram && (
          <motion.div
            key="programDetail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ProgramDetail
              program={selectedProgram}
              routines={programRoutines}
              exerciseTypes={exerciseTypes}
              availableRoutines={availableRoutines}
              onAddRoutine={handleAddRoutineToProgram}
              onRemoveRoutine={handleRemoveRoutineFromProgram}
              onDelete={handleDeleteProgram}
              onEdit={() => setDrawerMode('editProgram')}
              onBack={handleBackFromProgramDetail}
              onSelectRoutine={handleSelectRoutineFromProgram}
              breadcrumbs={programDetailBreadcrumbs}
            />
          </motion.div>
        )}

        {currentView === 'routineDetail' && selectedRoutine && (
          <motion.div
            key="routineDetail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <RoutineDetail
              routine={selectedRoutine}
              exerciseTypes={routineExerciseTypes}
              exercises={exercises}
              availableExerciseTypes={availableExerciseTypes}
              onAddExerciseType={handleAddExerciseTypeToRoutine}
              onRemoveExerciseType={handleRemoveExerciseTypeFromRoutine}
              onDelete={handleDeleteRoutine}
              onEdit={() => setDrawerMode('editRoutine')}
              onBack={handleBackFromRoutineDetail}
              onSelectExerciseType={handleSelectExerciseTypeFromRoutine}
              breadcrumbs={routineDetailBreadcrumbs}
            />
          </motion.div>
        )}

        {currentView === 'activeWorkout' && activeSession && selectedRoutine && (
          <motion.div
            key="activeWorkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveWorkout
              session={activeSession}
              routine={selectedRoutine}
              exerciseTypes={routineExerciseTypes}
              exercises={exercises}
              previousSessions={workoutSessions}
              onUpdateSession={handleUpdateWorkoutSession}
              onFinishWorkout={handleFinishWorkout}
              onBack={handleCancelWorkout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer.Root open={drawerMode !== null} onOpenChange={(open) => !open && setDrawerMode(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0">
            <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

              {drawerMode === 'exerciseType' && (
                <>
                  <Drawer.Title className="sr-only">Create Exercise Type</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new exercise type to your workout library
                  </Drawer.Description>
                  <CreateExerciseType
                    onSave={handleCreateExerciseType}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'exercise' && selectedExerciseType && (
                <>
                  <Drawer.Title className="sr-only">Create Exercise</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new exercise to {selectedExerciseType.name}
                  </Drawer.Description>
                  <CreateExercise
                    exerciseTypeId={selectedExerciseType.id}
                    onSave={handleCreateExercise}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'editExerciseType' && selectedExerciseType && (
                <>
                  <Drawer.Title className="sr-only">Edit Exercise Type</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update exercise type details
                  </Drawer.Description>
                  <EditExerciseType
                    exerciseType={selectedExerciseType}
                    onSave={handleEditExerciseType}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'routine' && (
                <>
                  <Drawer.Title className="sr-only">Create Routine</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new routine to your workout program
                  </Drawer.Description>
                  <CreateRoutine
                    exerciseTypes={exerciseTypes}
                    onSave={handleCreateRoutine}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'editRoutine' && selectedRoutine && (
                <>
                  <Drawer.Title className="sr-only">Edit Routine</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update routine details
                  </Drawer.Description>
                  <EditRoutine
                    routine={selectedRoutine}
                    onSave={handleEditRoutine}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'program' && (
                <>
                  <Drawer.Title className="sr-only">Create Program</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new program to organize your routines
                  </Drawer.Description>
                  <CreateProgram
                    routines={routines}
                    onSave={handleCreateProgram}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}

              {drawerMode === 'editProgram' && selectedProgram && (
                <>
                  <Drawer.Title className="sr-only">Edit Program</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Update program details
                  </Drawer.Description>
                  <EditProgram
                    program={selectedProgram}
                    onSave={handleEditProgram}
                    onCancel={() => setDrawerMode(null)}
                  />
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

export default App
