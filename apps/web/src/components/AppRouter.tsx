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
import { HomeSkeleton } from '@/components/LoadingSkeletons'
import { useRouteEntity } from '@/hooks/useRouteEntity'
import { RouteEntityWrapper } from '@/components/RouteEntityWrapper'
import { DRAWER_MODE } from '@/lib/constants'

export interface AppRouterProps {
  isLoading: boolean
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
  isLoading,
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

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <HomeSkeleton />
  }

  // Route wrapper components that fetch data based on URL params
  const ExerciseTypeDetailRoute = () => (
    <RouteEntityWrapper
      entities={exerciseTypes}
      getIdFromParams={(params) => params.id}
      fallbackPath="/exercise-types"
      render={(exerciseType, params) => {
        const id = params.id!
        const filteredExercises = exercises.filter(ex => ex.exerciseTypeId === id)
        return (
          <ExerciseList
            exerciseType={exerciseType}
            exercises={filteredExercises}
            onAdd={() => navigate(`?drawer=${DRAWER_MODE.CREATE_EXERCISE}&exerciseTypeId=${id}`)}
            onSelect={(exercise) => onSelectExercise(exercise, id)}
            onDelete={(exerciseId) => onDeleteExercise(exerciseId, id)}
            onDeleteExerciseType={onDeleteExerciseType}
            onEdit={() => navigate(`?drawer=${DRAWER_MODE.EDIT_EXERCISE_TYPE}&id=${id}`)}
            breadcrumbs={[
              { label: 'Home', onClick: () => navigate('/') },
              { label: 'Exercise Types', onClick: () => navigate('/exercise-types') },
              { label: exerciseType.name, onClick: () => { } }
            ]}
          />
        )
      }}
    />
  )

  const ExerciseDetailRoute = () => (
    <RouteEntityWrapper
      entities={exercises}
      getIdFromParams={(params) => params.exerciseId}
      fallbackPath=""
      render={(exercise, params) => (
        <ExerciseDetail
          exercise={exercise}
          onUpdate={onUpdateExercise}
          onDelete={(id) => onDeleteExercise(id, params.typeId!)}
        />
      )}
      findEntity={(exercises, id) => {
        const exercise = exercises.find(ex => ex.id === id)
        return exercise
      }}
    />
  )

  const RoutineDetailRoute = () => (
    <RouteEntityWrapper
      entities={routines}
      getIdFromParams={(params) => params.id}
      fallbackPath="/routines"
      render={(routine, params) => {
        const id = params.id!
        const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))
        const availableExerciseTypes = exerciseTypes.filter(et => !routine.exerciseTypeIds.includes(et.id))
        return (
          <RoutineDetail
            routine={routine}
            exerciseTypes={routineExerciseTypes}
            exercises={exercises}
            availableExerciseTypes={availableExerciseTypes}
            onAddExerciseType={(etId) => onAddExerciseTypeToRoutine(id, etId)}
            onRemoveExerciseType={(etId) => onRemoveExerciseTypeFromRoutine(id, etId)}
            onDelete={onDeleteRoutine}
            onEdit={() => navigate(`?drawer=${DRAWER_MODE.EDIT_ROUTINE}&id=${id}`)}
            onSelectExerciseType={(et) => onSelectExerciseTypeFromRoutine(id, et)}
            breadcrumbs={[
              { label: 'Home', onClick: () => navigate('/') },
              { label: 'Routines', onClick: () => navigate('/routines') },
              { label: routine.name, onClick: () => { } }
            ]}
          />
        )
      }}
    />
  )

  const ProgramDetailRoute = () => (
    <RouteEntityWrapper
      entities={programs}
      getIdFromParams={(params) => params.id}
      fallbackPath="/programs"
      render={(program, params) => {
        const id = params.id!
        const programRoutines = routines.filter(r => program.routineIds.includes(r.id))
        const availableRoutines = routines.filter(r => !program.routineIds.includes(r.id))
        return (
          <ProgramDetail
            program={program}
            routines={programRoutines}
            exerciseTypes={exerciseTypes}
            availableRoutines={availableRoutines}
            onAddRoutine={(rId) => onAddRoutineToProgram(id, rId)}
            onRemoveRoutine={(rId) => onRemoveRoutineFromProgram(id, rId)}
            onDelete={onDeleteProgram}
            onEdit={() => navigate(`?drawer=${DRAWER_MODE.EDIT_PROGRAM}&id=${id}`)}
            onSelectRoutine={(r) => onSelectRoutineFromProgram(id, r)}
            breadcrumbs={[
              { label: 'Home', onClick: () => navigate('/') },
              { label: 'Programs', onClick: () => navigate('/programs') },
              { label: program.name, onClick: () => { } }
            ]}
          />
        )
      }}
    />
  )

  const ProgramRoutineDetailRoute = () => {
    const { programId, routineId } = useParams<{ programId: string; routineId: string }>()
    const program = useRouteEntity(
      programs.find(p => p.id === programId),
      '/programs'
    )
    const routine = useRouteEntity(
      routines.find(r => r.id === routineId),
      '/programs'
    )

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
        onEdit={() => navigate(`?drawer=${DRAWER_MODE.EDIT_ROUTINE}&id=${routineId}`)}
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
    const routine = useRouteEntity(
      activeSession ? routines.find(r => r.id === activeSession.routineId) : undefined,
      '/'
    )

    if (!activeSession || !nextWorkoutInfo || !routine) {
      return null
    }

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
          onResumeWorkout={() => navigate('/workout/active')}
          activeSession={activeSession}
          nextRoutine={nextWorkoutInfo?.routine || null}
          currentProgram={nextWorkoutInfo?.program || null}
        />
      } />
      <Route path="/exercise-types" element={
        <ExerciseTypeList
          exerciseTypes={exerciseTypes}
          exercises={exercises}
          onAdd={() => navigate(`?drawer=${DRAWER_MODE.CREATE_EXERCISE_TYPE}`)}
          onSelect={onSelectExerciseType}
        />
      } />
      <Route path="/exercise-types/:id" element={<ExerciseTypeDetailRoute />} />
      <Route path="/exercise-types/:typeId/exercises/:exerciseId" element={<ExerciseDetailRoute />} />
      <Route path="/routines" element={
        <RoutineList
          routines={routines}
          exerciseTypes={exerciseTypes}
          onAdd={() => navigate(`?drawer=${DRAWER_MODE.CREATE_ROUTINE}`)}
          onSelect={onSelectRoutine}
        />
      } />
      <Route path="/routines/:id" element={<RoutineDetailRoute />} />
      <Route path="/programs" element={
        <ProgramList
          programs={programs}
          routines={routines}
          onAdd={() => navigate(`?drawer=${DRAWER_MODE.CREATE_PROGRAM}`)}
          onSelect={onSelectProgram}
        />
      } />
      <Route path="/programs/:id" element={<ProgramDetailRoute />} />
      <Route path="/programs/:programId/routines/:routineId" element={<ProgramRoutineDetailRoute />} />
      <Route path="/workout/active" element={<ActiveWorkoutRoute />} />
    </Routes>
  )
}
