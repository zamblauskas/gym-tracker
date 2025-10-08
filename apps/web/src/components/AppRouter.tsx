import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
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
import { useDrawer } from '@/hooks/useDrawer'
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
  const { openDrawer } = useDrawer()

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <HomeSkeleton />
  }

  // Route wrapper components that fetch data based on URL params
  const ExerciseTypeDetailRoute = () => {
    const location = useLocation()
    const locationState = location.state as { breadcrumbs?: Array<{ label: string; path: string }> } | null

    return (
      <RouteEntityWrapper
        entities={exerciseTypes}
        getIdFromParams={(params) => params.id}
        fallbackPath="/exercise-types"
        render={(exerciseType, params) => {
          const id = params.id!
          const filteredExercises = exercises.filter(ex => ex.exerciseTypeId === id)

          // Use breadcrumbs from location state if available, otherwise use default
          const breadcrumbs = locationState?.breadcrumbs
            ? locationState.breadcrumbs.map(bc => ({
                label: bc.label,
                onClick: () => navigate(bc.path)
              })).concat([{ label: exerciseType.name, onClick: () => {} }])
            : [
                { label: 'Home', onClick: () => navigate('/') },
                { label: 'Exercise Types', onClick: () => navigate('/exercise-types') },
                { label: exerciseType.name, onClick: () => {} }
              ]

          // Prepare breadcrumbs to pass via location state when navigating to exercise
          const breadcrumbsForExercise = locationState?.breadcrumbs
            ? [...locationState.breadcrumbs, { label: exerciseType.name, path: `/exercise-types/${id}` }]
            : [
                { label: 'Home', path: '/' },
                { label: 'Exercise Types', path: '/exercise-types' },
                { label: exerciseType.name, path: `/exercise-types/${id}` }
              ]

          return (
            <ExerciseList
              exerciseType={exerciseType}
              exercises={filteredExercises}
              onAdd={() => openDrawer(DRAWER_MODE.CREATE_EXERCISE, { exerciseTypeId: id })}
              onSelect={(exercise) => onSelectExercise(exercise, id, breadcrumbsForExercise)}
              onDelete={(exerciseId) => onDeleteExercise(exerciseId, id)}
              onDeleteExerciseType={onDeleteExerciseType}
              onEdit={() => openDrawer(DRAWER_MODE.EDIT_EXERCISE_TYPE, { id })}
              breadcrumbs={breadcrumbs}
            />
          )
        }}
      />
    )
  }

  const ExerciseDetailRoute = () => {
    const location = useLocation()
    const locationState = location.state as { breadcrumbs?: Array<{ label: string; path: string }> } | null

    return (
      <RouteEntityWrapper
        entities={exercises}
        getIdFromParams={(params) => params.id}
        fallbackPath="/exercise-types"
        render={(exercise, params) => {
          // Use breadcrumbs from location state if available, otherwise use default
          const breadcrumbs = locationState?.breadcrumbs
            ? locationState.breadcrumbs.map(bc => ({
                label: bc.label,
                onClick: () => navigate(bc.path)
              })).concat([{ label: exercise.name, onClick: () => {} }])
            : [
                { label: 'Home', onClick: () => navigate('/') },
                { label: 'Exercise Types', onClick: () => navigate('/exercise-types') },
                { label: exercise.name, onClick: () => {} }
              ]

          return (
            <ExerciseDetail
              exercise={exercise}
              onUpdate={onUpdateExercise}
              onDelete={(id) => onDeleteExercise(id, exercise.exerciseTypeId)}
              breadcrumbs={breadcrumbs}
            />
          )
        }}
      />
    )
  }

  const RoutineDetailRoute = () => {
    const location = useLocation()
    const locationState = location.state as { breadcrumbs?: Array<{ label: string; path: string }> } | null

    return (
      <RouteEntityWrapper
        entities={routines}
        getIdFromParams={(params) => params.id}
        fallbackPath="/routines"
        render={(routine, params) => {
          const id = params.id!
          const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))

          // Use breadcrumbs from location state if available, otherwise use default
          const breadcrumbs = locationState?.breadcrumbs
            ? locationState.breadcrumbs.map(bc => ({
                label: bc.label,
                onClick: () => navigate(bc.path)
              })).concat([{ label: routine.name, onClick: () => {} }])
            : [
                { label: 'Home', onClick: () => navigate('/') },
                { label: 'Routines', onClick: () => navigate('/routines') },
                { label: routine.name, onClick: () => {} }
              ]

          // Prepare breadcrumbs to pass via location state when navigating to exercise type
          const breadcrumbsForExerciseType = locationState?.breadcrumbs
            ? [...locationState.breadcrumbs, { label: routine.name, path: `/routines/${id}` }]
            : [
                { label: 'Home', path: '/' },
                { label: 'Routines', path: '/routines' },
                { label: routine.name, path: `/routines/${id}` }
              ]

          return (
            <RoutineDetail
              routine={routine}
              exerciseTypes={routineExerciseTypes}
              exercises={exercises}
              onRemoveExerciseType={(etId) => onRemoveExerciseTypeFromRoutine(id, etId)}
              onDelete={onDeleteRoutine}
              onEdit={() => openDrawer(DRAWER_MODE.EDIT_ROUTINE, { id })}
              onSelectExerciseType={(et) => onSelectExerciseTypeFromRoutine(id, et, undefined, breadcrumbsForExerciseType)}
              breadcrumbs={breadcrumbs}
            />
          )
        }}
      />
    )
  }

  const ProgramDetailRoute = () => (
    <RouteEntityWrapper
      entities={programs}
      getIdFromParams={(params) => params.id}
      fallbackPath="/programs"
      render={(program, params) => {
        const id = params.id!
        const programRoutines = routines.filter(r => program.routineIds.includes(r.id))
        const availableRoutines = routines.filter(r => !program.routineIds.includes(r.id))

        // Prepare breadcrumbs to pass via location state when navigating to routine
        const breadcrumbsForRoutine = [
          { label: 'Home', path: '/' },
          { label: 'Programs', path: '/programs' },
          { label: program.name, path: `/programs/${id}` }
        ]

        return (
          <ProgramDetail
            program={program}
            routines={programRoutines}
            exerciseTypes={exerciseTypes}
            availableRoutines={availableRoutines}
            onAddRoutine={(rId) => onAddRoutineToProgram(id, rId)}
            onRemoveRoutine={(rId) => onRemoveRoutineFromProgram(id, rId)}
            onDelete={onDeleteProgram}
            onEdit={() => openDrawer(DRAWER_MODE.EDIT_PROGRAM, { id })}
            onSelectRoutine={(r) => onSelectRoutineFromProgram(id, r, breadcrumbsForRoutine)}
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

  const ActiveWorkoutRoute = () => {
    const { exerciseIndex } = useParams<{ exerciseIndex: string }>()
    const routine = useRouteEntity(
      activeSession ? routines.find(r => r.id === activeSession.routineId) : undefined,
      '/'
    )

    if (!activeSession || !nextWorkoutInfo || !routine) {
      return null
    }

    const routineExerciseTypes = exerciseTypes.filter(et => routine.exerciseTypeIds.includes(et.id))

    // Parse exercise index from URL, default to 0
    const currentIndex = exerciseIndex ? parseInt(exerciseIndex, 10) : 0

    // Redirect to first exercise if no index or invalid index
    if (exerciseIndex === undefined || isNaN(currentIndex) || currentIndex < 0 || currentIndex >= routineExerciseTypes.length) {
      navigate('/workout/active/0', { replace: true })
      return null
    }

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
        currentExerciseIndex={currentIndex}
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
          onResumeWorkout={() => navigate('/workout/active/0')}
          activeSession={activeSession}
          nextRoutine={nextWorkoutInfo?.routine || null}
          currentProgram={nextWorkoutInfo?.program || null}
        />
      } />
      <Route path="/exercise-types" element={
        <ExerciseTypeList
          exerciseTypes={exerciseTypes}
          exercises={exercises}
          onAdd={() => openDrawer(DRAWER_MODE.CREATE_EXERCISE_TYPE)}
          onSelect={onSelectExerciseType}
        />
      } />
      <Route path="/exercise-types/:id" element={<ExerciseTypeDetailRoute />} />
      <Route path="/exercises/:id" element={<ExerciseDetailRoute />} />
      <Route path="/routines" element={
        <RoutineList
          routines={routines}
          exerciseTypes={exerciseTypes}
          onAdd={() => openDrawer(DRAWER_MODE.CREATE_ROUTINE)}
          onSelect={onSelectRoutine}
        />
      } />
      <Route path="/routines/:id" element={<RoutineDetailRoute />} />
      <Route path="/programs" element={
        <ProgramList
          programs={programs}
          routines={routines}
          onAdd={() => openDrawer(DRAWER_MODE.CREATE_PROGRAM)}
          onSelect={onSelectProgram}
        />
      } />
      <Route path="/programs/:id" element={<ProgramDetailRoute />} />
      <Route path="/workout/active/:exerciseIndex" element={<ActiveWorkoutRoute />} />
    </Routes>
  )
}
