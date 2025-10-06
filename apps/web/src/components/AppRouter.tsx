import { useEffect } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import Home from '@/pages/Home'
import ExerciseTypeList from '@/pages/ExerciseTypeList'
import ExerciseList from '@/pages/ExerciseList'
import ExerciseDetail from '@/pages/ExerciseDetail'
import RoutineList from '@/pages/RoutineList'
import RoutineDetail from '@/pages/RoutineDetail'
import ProgramList from '@/pages/ProgramList'
import ProgramDetail from '@/pages/ProgramDetail'
import ActiveWorkout from '@/pages/ActiveWorkout'
import { ExerciseType } from '@/types/exerciseType'
import { Exercise } from '@/types/exercise'
import { Routine } from '@/types/routine'
import { Program } from '@/types/program'
import { WorkoutSession } from '@/types/workoutSession'
import { NextWorkoutInfo } from '@/hooks/useWorkoutLogic'

export interface AppRouterProps {
  exerciseTypes: ExerciseType[]
  exercises: Exercise[]
  routines: Routine[]
  programs: Program[]
  activeSession: WorkoutSession | null
  nextWorkoutInfo: NextWorkoutInfo | null
  workoutSessions: WorkoutSession[]
  onSelectExerciseType: (exerciseType: ExerciseType) => void
  onSelectExercise: (exercise: Exercise, exerciseTypeId: string) => void
  onSelectRoutine: (routine: Routine) => void
  onSelectProgram: (program: Program) => void
  onSelectRoutineFromProgram: (programId: string, routine: Routine) => void
  onSelectExerciseTypeFromRoutine: (routineId: string, exerciseType: ExerciseType, programId?: string) => void
  onDeleteExercise: (exerciseId: string, exerciseTypeId: string) => void
  onDeleteExerciseType: (exerciseTypeId: string) => void
  onDeleteRoutine: (routineId: string) => void
  onDeleteProgram: (programId: string) => void
  onUpdateExercise: (exercise: Exercise) => void
  onAddExerciseTypeToRoutine: (routineId: string, exerciseTypeId: string) => void
  onRemoveExerciseTypeFromRoutine: (routineId: string, exerciseTypeId: string) => void
  onAddRoutineToProgram: (programId: string, routineId: string) => void
  onRemoveRoutineFromProgram: (programId: string, routineId: string) => void
  onStartWorkout: () => void
  onSkipWorkout: () => void
  onUpdateWorkoutSession: (session: WorkoutSession) => void
  onFinishWorkout: (session: WorkoutSession) => void
  onCancelWorkout: () => void
}

export function AppRouter({
  exerciseTypes,
  exercises,
  routines,
  programs,
  activeSession,
  nextWorkoutInfo,
  workoutSessions,
  onSelectExerciseType,
  onSelectExercise,
  onSelectRoutine,
  onSelectProgram,
  onSelectRoutineFromProgram,
  onSelectExerciseTypeFromRoutine,
  onDeleteExercise,
  onDeleteExerciseType,
  onDeleteRoutine,
  onDeleteProgram,
  onUpdateExercise,
  onAddExerciseTypeToRoutine,
  onRemoveExerciseTypeFromRoutine,
  onAddRoutineToProgram,
  onRemoveRoutineFromProgram,
  onStartWorkout,
  onSkipWorkout,
  onUpdateWorkoutSession,
  onFinishWorkout,
  onCancelWorkout,
}: AppRouterProps) {
  const navigate = useNavigate()

  // Route wrapper components that fetch data based on URL params
  const ExerciseTypeDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const exerciseType = exerciseTypes.find(et => et.id === id)

    useEffect(() => {
      if (!exerciseType) {
        navigate('/exercise-types')
      }
    }, [exerciseType])

    if (!exerciseType) return null

    const filteredExercises = exercises.filter(ex => ex.exerciseTypeId === id)
    return (
      <ExerciseList
        exerciseType={exerciseType}
        exercises={filteredExercises}
        onAdd={() => navigate(`/exercise-types/${id}/exercises/new`)}
        onSelect={(exercise) => onSelectExercise(exercise, id!)}
        onDelete={(exerciseId) => onDeleteExercise(exerciseId, id!)}
        onDeleteExerciseType={onDeleteExerciseType}
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

    useEffect(() => {
      if (!exercise) {
        navigate(`/exercise-types/${typeId}`)
      }
    }, [exercise, typeId])

    if (!exercise) return null

    return (
      <ExerciseDetail
        exercise={exercise}
        onUpdate={onUpdateExercise}
        onDelete={(id) => onDeleteExercise(id, typeId!)}
      />
    )
  }

  const RoutineDetailRoute = () => {
    const { id } = useParams<{ id: string }>()
    const routine = routines.find(r => r.id === id)

    useEffect(() => {
      if (!routine) {
        navigate('/routines')
      }
    }, [routine])

    if (!routine) return null

    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
    const availableExerciseTypes = exerciseTypes.filter(et => !routine.exerciseTypeIds.includes(et.id))
    return (
      <RoutineDetail
        routine={routine}
        exerciseTypes={routineExerciseTypes}
        exercises={exercises}
        availableExerciseTypes={availableExerciseTypes}
        onAddExerciseType={(etId) => onAddExerciseTypeToRoutine(id!, etId)}
        onRemoveExerciseType={(etId) => onRemoveExerciseTypeFromRoutine(id!, etId)}
        onDelete={onDeleteRoutine}
        onEdit={() => navigate(`/routines/${id}/edit`)}
        onSelectExerciseType={(et) => onSelectExerciseTypeFromRoutine(id!, et)}
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

    useEffect(() => {
      if (!program) {
        navigate('/programs')
      }
    }, [program])

    if (!program) return null

    const programRoutines = routines.filter(r => program.routineIds.includes(r.id))
    const availableRoutines = routines.filter(r => !program.routineIds.includes(r.id))
    return (
      <ProgramDetail
        program={program}
        routines={programRoutines}
        exerciseTypes={exerciseTypes}
        availableRoutines={availableRoutines}
        onAddRoutine={(rId) => onAddRoutineToProgram(id!, rId)}
        onRemoveRoutine={(rId) => onRemoveRoutineFromProgram(id!, rId)}
        onDelete={onDeleteProgram}
        onEdit={() => navigate(`/programs/${id}/edit`)}
        onSelectRoutine={(r) => onSelectRoutineFromProgram(id!, r)}
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Programs', onClick: () => navigate('/programs') },
          { label: program.name, onClick: () => { } }
        ]}
      />
    )
  }

  const ProgramRoutineDetailRoute = () => {
    const { programId, routineId } = useParams<{ programId: string; routineId: string }>()
    const program = programs.find(p => p.id === programId)
    const routine = routines.find(r => r.id === routineId)

    useEffect(() => {
      if (!program || !routine) {
        navigate('/programs')
      }
    }, [program, routine])

    if (!program || !routine) return null

    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
    const availableExerciseTypes = exerciseTypes.filter(et => !routine.exerciseTypeIds.includes(et.id))
    return (
      <RoutineDetail
        routine={routine}
        exerciseTypes={routineExerciseTypes}
        exercises={exercises}
        availableExerciseTypes={availableExerciseTypes}
        onAddExerciseType={(etId) => onAddExerciseTypeToRoutine(routineId!, etId)}
        onRemoveExerciseType={(etId) => onRemoveExerciseTypeFromRoutine(routineId!, etId)}
        onDelete={onDeleteRoutine}
        onEdit={() => navigate(`/programs/${programId}/routines/${routineId}/edit`)}
        onSelectExerciseType={(et) => onSelectExerciseTypeFromRoutine(routineId!, et, programId)}
        breadcrumbs={[
          { label: 'Home', onClick: () => navigate('/') },
          { label: 'Programs', onClick: () => navigate('/programs') },
          { label: program.name, onClick: () => navigate(`/programs/${programId}`) },
          { label: routine.name, onClick: () => { } }
        ]}
      />
    )
  }

  const ActiveWorkoutRoute = () => {
    const routine = activeSession ? routines.find(r => r.id === activeSession.routineId) : null

    useEffect(() => {
      if (!activeSession || !nextWorkoutInfo || !routine) {
        navigate('/')
      }
    }, [activeSession, nextWorkoutInfo, routine])

    if (!activeSession || !nextWorkoutInfo || !routine) return null

    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
    return (
      <ActiveWorkout
        session={activeSession}
        routine={routine}
        exerciseTypes={routineExerciseTypes}
        exercises={exercises}
        previousSessions={workoutSessions}
        onUpdateSession={onUpdateWorkoutSession}
        onFinishWorkout={onFinishWorkout}
        onBack={onCancelWorkout}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={
        <Home
          onNavigateToPrograms={() => navigate('/programs')}
          onNavigateToRoutines={() => navigate('/routines')}
          onNavigateToExerciseTypes={() => navigate('/exercise-types')}
          onStartWorkout={onStartWorkout}
          onSkipWorkout={onSkipWorkout}
          nextRoutine={nextWorkoutInfo?.routine || null}
          currentProgram={nextWorkoutInfo?.program || null}
        />
      } />
      <Route path="/exercise-types" element={
        <ExerciseTypeList
          exerciseTypes={exerciseTypes}
          exercises={exercises}
          onAdd={() => navigate('/exercise-types/new')}
          onSelect={onSelectExerciseType}
        />
      } />
      <Route path="/exercise-types/new" element={
        <ExerciseTypeList
          exerciseTypes={exerciseTypes}
          exercises={exercises}
          onAdd={() => navigate('/exercise-types/new')}
          onSelect={onSelectExerciseType}
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
          onSelect={onSelectRoutine}
        />
      } />
      <Route path="/routines/new" element={
        <RoutineList
          routines={routines}
          exerciseTypes={exerciseTypes}
          onAdd={() => navigate('/routines/new')}
          onSelect={onSelectRoutine}
        />
      } />
      <Route path="/routines/:id" element={<RoutineDetailRoute />} />
      <Route path="/routines/:id/edit" element={<RoutineDetailRoute />} />
      <Route path="/programs" element={
        <ProgramList
          programs={programs}
          routines={routines}
          onAdd={() => navigate('/programs/new')}
          onSelect={onSelectProgram}
        />
      } />
      <Route path="/programs/new" element={
        <ProgramList
          programs={programs}
          routines={routines}
          onAdd={() => navigate('/programs/new')}
          onSelect={onSelectProgram}
        />
      } />
      <Route path="/programs/:id" element={<ProgramDetailRoute />} />
      <Route path="/programs/:id/edit" element={<ProgramDetailRoute />} />
      <Route path="/programs/:programId/routines/:routineId" element={<ProgramRoutineDetailRoute />} />
      <Route path="/programs/:programId/routines/:routineId/edit" element={<ProgramRoutineDetailRoute />} />
      <Route path="/workout/active" element={<ActiveWorkoutRoute />} />
    </Routes>
  )
}
