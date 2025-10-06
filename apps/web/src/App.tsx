import { useState, useMemo } from 'react'
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Drawer } from 'vaul'
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

function App() {
  // Create repository instances (memoized to avoid recreating on every render)
  const exerciseTypeRepo = useMemo(() => createExerciseTypeRepository(), [])
  const exerciseRepo = useMemo(() => createExerciseRepository(), [])
  const routineRepo = useMemo(() => createRoutineRepository(), [])
  const programRepo = useMemo(() => createProgramRepository(), [])
  const workoutSessionRepo = useMemo(() => createWorkoutSessionRepository(), [])

  const navigate = useNavigate()
  const location = useLocation()
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)

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
    navigate('/exercise-types')
  }

  const handleSelectExerciseType = (exerciseType: ExerciseType) => {
    navigate(`/exercise-types/${exerciseType.id}`)
  }

  const handleEditExerciseType = (id: string, name: string) => {
    const updatedExerciseType: ExerciseType = {
      ...exerciseTypes.find(et => et.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setExerciseTypes(exerciseTypes.map(et => et.id === id ? updatedExerciseType : et))
    navigate(-1)
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
    navigate(-1)
  }

  const handleSelectExercise = (exercise: Exercise, exerciseTypeId: string) => {
    navigate(`/exercise-types/${exerciseTypeId}/exercises/${exercise.id}`)
  }

  const handleUpdateExercise = (updatedExercise: Exercise) => {
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex))
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
    navigate('/routines')
  }

  const handleSelectRoutine = (routine: Routine) => {
    navigate(`/routines/${routine.id}`)
  }

  const handleEditRoutine = (id: string, name: string) => {
    const updatedRoutine: Routine = {
      ...routines.find(r => r.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setRoutines(routines.map(r => r.id === id ? updatedRoutine : r))
    navigate(-1)
  }

  const handleAddExerciseTypeToRoutine = (routineId: string, exerciseTypeId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return

    const updatedRoutine = {
      ...routine,
      exerciseTypeIds: [...routine.exerciseTypeIds, exerciseTypeId],
      updatedAt: new Date(),
    }

    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
  }

  const handleRemoveExerciseTypeFromRoutine = (routineId: string, exerciseTypeId: string) => {
    const routine = routines.find(r => r.id === routineId)
    if (!routine) return

    const updatedRoutine = {
      ...routine,
      exerciseTypeIds: routine.exerciseTypeIds.filter(id => id !== exerciseTypeId),
      updatedAt: new Date(),
    }

    setRoutines(routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r))
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
    navigate('/programs')
  }

  const handleSelectProgram = (program: Program) => {
    navigate(`/programs/${program.id}`)
  }

  const handleEditProgram = (id: string, name: string) => {
    const updatedProgram: Program = {
      ...programs.find(p => p.id === id)!,
      name,
      updatedAt: new Date(),
    }
    setPrograms(programs.map(p => p.id === id ? updatedProgram : p))
    navigate(-1)
  }

  const handleAddRoutineToProgram = (programId: string, routineId: string) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    const updatedProgram = {
      ...program,
      routineIds: [...program.routineIds, routineId],
      updatedAt: new Date(),
    }

    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
  }

  const handleRemoveRoutineFromProgram = (programId: string, routineId: string) => {
    const program = programs.find(p => p.id === programId)
    if (!program) return

    const updatedProgram = {
      ...program,
      routineIds: program.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    }

    setPrograms(programs.map(p => p.id === updatedProgram.id ? updatedProgram : p))
  }

  // Hierarchical navigation handlers
  const handleSelectRoutineFromProgram = (programId: string, routine: Routine) => {
    navigate(`/programs/${programId}/routines/${routine.id}`)
  }

  const handleSelectExerciseTypeFromRoutine = (routineId: string, exerciseType: ExerciseType, programId?: string) => {
    if (programId) {
      navigate(`/programs/${programId}/routines/${routineId}/exercise-types/${exerciseType.id}`)
    } else {
      navigate(`/routines/${routineId}/exercise-types/${exerciseType.id}`)
    }
  }

  // Deletion handlers
  const handleDeleteExercise = (exerciseId: string, exerciseTypeId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId))
    // Navigate back to exercise type detail
    navigate(`/exercise-types/${exerciseTypeId}`)
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

    // Navigate back to exercise types list
    navigate('/exercise-types')
  }

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(routines.filter(r => r.id !== routineId))

    // Remove from programs
    setPrograms(programs.map(program => ({
      ...program,
      routineIds: program.routineIds.filter(id => id !== routineId),
      updatedAt: new Date(),
    })))

    // Navigate back to routines list
    navigate('/routines')
  }

  const handleDeleteProgram = (programId: string) => {
    setPrograms(programs.filter(p => p.id !== programId))

    // Navigate back to programs list
    navigate('/programs')
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
    navigate('/workout/active')
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
    navigate('/')
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

  // Route wrapper components that fetch data based on URL params
  const ExerciseTypeDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const exerciseType = exerciseTypes.find(et => et.id === id)
    if (!exerciseType) {
      navigate('/exercise-types')
      return null
    }
    const filteredExercises = exercises.filter(ex => ex.exerciseTypeId === id)
    return (
      <ExerciseList
        exerciseType={exerciseType}
        exercises={filteredExercises}
        onAdd={() => navigate(`/exercise-types/${id}/exercises/new`)}
        onSelect={(exercise) => handleSelectExercise(exercise, id!)}
        onDelete={(exerciseId) => handleDeleteExercise(exerciseId, id!)}
        onDeleteExerciseType={handleDeleteExerciseType}
        onEdit={() => navigate(`/exercise-types/${id}/edit`)}
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Exercise Types', onClick: () => navigate('/exercise-types') },
          { label: exerciseType.name, onClick: () => { } }
        ]}
      />
    )
  }

  const ExerciseDetailRoute = () => {
    const { typeId, exerciseId } = useParams<{ typeId: string; exerciseId: string }>()
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (!exercise) {
      navigate(`/exercise-types/${typeId}`)
      return null
    }
    return (
      <ExerciseDetail
        exercise={exercise}
        onUpdate={handleUpdateExercise}
        onDelete={(id) => handleDeleteExercise(id, typeId!)}
      />
    )
  }

  const RoutineDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const routine = routines.find(r => r.id === id)
    if (!routine) {
      navigate('/routines')
      return null
    }
    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
    const availableExerciseTypes = exerciseTypes.filter(et => !routine.exerciseTypeIds.includes(et.id))
    return (
      <RoutineDetail
        routine={routine}
        exerciseTypes={routineExerciseTypes}
        exercises={exercises}
        availableExerciseTypes={availableExerciseTypes}
        onAddExerciseType={(etId) => handleAddExerciseTypeToRoutine(id!, etId)}
        onRemoveExerciseType={(etId) => handleRemoveExerciseTypeFromRoutine(id!, etId)}
        onDelete={handleDeleteRoutine}
        onEdit={() => navigate(`/routines/${id}/edit`)}
        onSelectExerciseType={(et) => handleSelectExerciseTypeFromRoutine(id!, et)}
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Routines', onClick: () => navigate('/routines') },
          { label: routine.name, onClick: () => { } }
        ]}
      />
    )
  }

  const ProgramDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const program = programs.find(p => p.id === id)
    if (!program) {
      navigate('/programs')
      return null
    }
    const programRoutines = routines.filter(r => program.routineIds.includes(r.id))
    const availableRoutines = routines.filter(r => !program.routineIds.includes(r.id))
    return (
      <ProgramDetail
        program={program}
        routines={programRoutines}
        exerciseTypes={exerciseTypes}
        availableRoutines={availableRoutines}
        onAddRoutine={(rId) => handleAddRoutineToProgram(id!, rId)}
        onRemoveRoutine={(rId) => handleRemoveRoutineFromProgram(id!, rId)}
        onDelete={handleDeleteProgram}
        onEdit={() => navigate(`/programs/${id}/edit`)}
        onSelectRoutine={(r) => handleSelectRoutineFromProgram(id!, r)}
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Programs', onClick: () => navigate('/programs') },
          { label: program.name, onClick: () => { } }
        ]}
      />
    )
  }

  const ActiveWorkoutRoute = () => {
    if (!activeSession || !nextWorkoutInfo) {
      navigate('/')
      return null
    }
    const routine = routines.find(r => r.id === activeSession.routineId)
    if (!routine) {
      navigate('/')
      return null
    }
    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
    const handleCancelWorkout = () => {
      setActiveSession(null)
      navigate('/')
    }
    return (
      <ActiveWorkout
        session={activeSession}
        routine={routine}
        exerciseTypes={routineExerciseTypes}
        exercises={exercises}
        previousSessions={workoutSessions}
        onUpdateSession={handleUpdateWorkoutSession}
        onFinishWorkout={handleFinishWorkout}
        onBack={handleCancelWorkout}
      />
    )
  }

  // Detect drawer state from URL
  const isDrawerOpen = useMemo(() => {
    const path = location.pathname
    return !!(
      path === '/exercise-types/new' ||
      path.match(/^\/exercise-types\/[^/]+\/edit$/) ||
      path.match(/^\/exercise-types\/[^/]+\/exercises\/new$/) ||
      path === '/routines/new' ||
      path.match(/^\/routines\/[^/]+\/edit$/) ||
      path === '/programs/new' ||
      path.match(/^\/programs\/[^/]+\/edit$/)
    )
  }, [location.pathname])

  const getDrawerMode = () => {
    const path = location.pathname
    if (path === '/exercise-types/new') return 'exerciseType'
    if (path.match(/^\/exercise-types\/[^/]+\/edit$/)) return 'editExerciseType'
    if (path.match(/^\/exercise-types\/[^/]+\/exercises\/new$/)) return 'exercise'
    if (path === '/routines/new') return 'routine'
    if (path.match(/^\/routines\/[^/]+\/edit$/)) return 'editRoutine'
    if (path === '/programs/new') return 'program'
    if (path.match(/^\/programs\/[^/]+\/edit$/)) return 'editProgram'
    return null
  }

  // Get current entity for drawer based on URL
  const getCurrentExerciseType = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'exercise-types' && pathParts[2] && pathParts[2] !== 'new') {
      return exerciseTypes.find(et => et.id === pathParts[2])
    }
    return null
  }

  const getCurrentRoutine = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'routines' && pathParts[2] && pathParts[2] !== 'new') {
      return routines.find(r => r.id === pathParts[2])
    }
    if (pathParts[1] === 'programs' && pathParts[4] === 'routines' && pathParts[5]) {
      return routines.find(r => r.id === pathParts[5])
    }
    return null
  }

  const getCurrentProgram = () => {
    const pathParts = location.pathname.split('/')
    if (pathParts[1] === 'programs' && pathParts[2] && pathParts[2] !== 'new') {
      return programs.find(p => p.id === pathParts[2])
    }
    return null
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={
          <Home
            onNavigateToPrograms={() => navigate('/programs')}
            onNavigateToRoutines={() => navigate('/routines')}
            onNavigateToExerciseTypes={() => navigate('/exercise-types')}
            onStartWorkout={handleStartWorkout}
            onSkipWorkout={handleSkipWorkout}
            nextRoutine={nextWorkoutInfo?.routine || null}
            currentProgram={nextWorkoutInfo?.program || null}
          />
        } />
        <Route path="/exercise-types" element={
          <ExerciseTypeList
            exerciseTypes={exerciseTypes}
            exercises={exercises}
            onAdd={() => navigate('/exercise-types/new')}
            onSelect={handleSelectExerciseType}
          />
        } />
        <Route path="/exercise-types/new" element={
          <ExerciseTypeList
            exerciseTypes={exerciseTypes}
            exercises={exercises}
            onAdd={() => navigate('/exercise-types/new')}
            onSelect={handleSelectExerciseType}
          />
        } />
        <Route path="/exercise-types/:id" element={<ExerciseTypeDetailRoute />} />
        <Route path="/exercise-types/:id/edit" element={<ExerciseTypeDetailRoute />} />
        <Route path="/exercise-types/:id/exercises/new" element={<ExerciseTypeDetailRoute />} />
        <Route path="/exercise-types/:typeId/exercises/:exerciseId" element={<ExerciseDetailRoute />} />
        <Route path="/routines" element={
          <RoutineList
            routines={routines}
            exerciseTypes={exerciseTypes}
            onAdd={() => navigate('/routines/new')}
            onSelect={handleSelectRoutine}
          />
        } />
        <Route path="/routines/new" element={
          <RoutineList
            routines={routines}
            exerciseTypes={exerciseTypes}
            onAdd={() => navigate('/routines/new')}
            onSelect={handleSelectRoutine}
          />
        } />
        <Route path="/routines/:id" element={<RoutineDetailRoute />} />
        <Route path="/routines/:id/edit" element={<RoutineDetailRoute />} />
        <Route path="/programs" element={
          <ProgramList
            programs={programs}
            routines={routines}
            onAdd={() => navigate('/programs/new')}
            onSelect={handleSelectProgram}
          />
        } />
        <Route path="/programs/new" element={
          <ProgramList
            programs={programs}
            routines={routines}
            onAdd={() => navigate('/programs/new')}
            onSelect={handleSelectProgram}
          />
        } />
        <Route path="/programs/:id" element={<ProgramDetailRoute />} />
        <Route path="/programs/:id/edit" element={<ProgramDetailRoute />} />
        <Route path="/workout/active" element={<ActiveWorkoutRoute />} />
      </Routes>

      <Drawer.Root open={isDrawerOpen} onOpenChange={(open) => !open && navigate(-1)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40" />
          <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0">
            <div className="p-4 bg-[hsl(var(--color-background))] rounded-t-[10px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-8" />

              {getDrawerMode() === 'exerciseType' && (
                <>
                  <Drawer.Title className="sr-only">Create Exercise Type</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new exercise type to your workout library
                  </Drawer.Description>
                  <CreateExerciseType
                    onSave={handleCreateExerciseType}
                    onCancel={() => navigate(-1)}
                  />
                </>
              )}

              {getDrawerMode() === 'exercise' && (() => {
                const exerciseType = getCurrentExerciseType()
                return exerciseType ? (
                  <>
                    <Drawer.Title className="sr-only">Create Exercise</Drawer.Title>
                    <Drawer.Description className="sr-only">
                      Add a new exercise to {exerciseType.name}
                    </Drawer.Description>
                    <CreateExercise
                      exerciseTypeId={exerciseType.id}
                      onSave={handleCreateExercise}
                      onCancel={() => navigate(-1)}
                    />
                  </>
                ) : null
              })()}

              {getDrawerMode() === 'editExerciseType' && (() => {
                const exerciseType = getCurrentExerciseType()
                return exerciseType ? (
                  <>
                    <Drawer.Title className="sr-only">Edit Exercise Type</Drawer.Title>
                    <Drawer.Description className="sr-only">
                      Update exercise type details
                    </Drawer.Description>
                    <EditExerciseType
                      exerciseType={exerciseType}
                      onSave={handleEditExerciseType}
                      onCancel={() => navigate(-1)}
                    />
                  </>
                ) : null
              })()}

              {getDrawerMode() === 'routine' && (
                <>
                  <Drawer.Title className="sr-only">Create Routine</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new routine to your workout program
                  </Drawer.Description>
                  <CreateRoutine
                    exerciseTypes={exerciseTypes}
                    onSave={handleCreateRoutine}
                    onCancel={() => navigate(-1)}
                  />
                </>
              )}

              {getDrawerMode() === 'editRoutine' && (() => {
                const routine = getCurrentRoutine()
                return routine ? (
                  <>
                    <Drawer.Title className="sr-only">Edit Routine</Drawer.Title>
                    <Drawer.Description className="sr-only">
                      Update routine details
                    </Drawer.Description>
                    <EditRoutine
                      routine={routine}
                      onSave={handleEditRoutine}
                      onCancel={() => navigate(-1)}
                    />
                  </>
                ) : null
              })()}

              {getDrawerMode() === 'program' && (
                <>
                  <Drawer.Title className="sr-only">Create Program</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Add a new program to organize your routines
                  </Drawer.Description>
                  <CreateProgram
                    routines={routines}
                    onSave={handleCreateProgram}
                    onCancel={() => navigate(-1)}
                  />
                </>
              )}

              {getDrawerMode() === 'editProgram' && (() => {
                const program = getCurrentProgram()
                return program ? (
                  <>
                    <Drawer.Title className="sr-only">Edit Program</Drawer.Title>
                    <Drawer.Description className="sr-only">
                      Update program details
                    </Drawer.Description>
                    <EditProgram
                      program={program}
                      onSave={handleEditProgram}
                      onCancel={() => navigate(-1)}
                    />
                  </>
                ) : null
              })()}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

export default App
