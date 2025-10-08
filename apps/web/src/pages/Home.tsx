import { logger } from '@/lib/utils/logger'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PersonStanding, RefreshCw, ScrollText, Play, SkipForward, LogIn, LogOut, Pause } from 'lucide-react'
import { Drawer } from 'vaul'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Program } from '@/types/program'
import { Routine } from '@/types/routine'
import { WorkoutSession } from '@/types/workoutSession'
import { useAuth } from '@/contexts/AuthContext'
import { Z_INDEX } from '@/lib/constants'

interface HomeProps {
  onNavigateToPrograms: () => void
  onNavigateToRoutines: () => void
  onNavigateToExerciseTypes: () => void
  onStartWorkout?: () => void
  onSkipWorkout?: () => void
  onResumeWorkout?: () => void
  activeSession?: WorkoutSession | null
  nextRoutine?: Routine | null
  currentProgram?: Program | null
}

export default function Home({
  onNavigateToPrograms,
  onNavigateToRoutines,
  onNavigateToExerciseTypes,
  onStartWorkout,
  onSkipWorkout,
  onResumeWorkout,
  activeSession,
  nextRoutine,
  currentProgram
}: HomeProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleSkipClick = () => {
    setShowSkipConfirmation(true)
  }

  const handleConfirmSkip = () => {
    if (onSkipWorkout) {
      onSkipWorkout()
    }
  }

  const handleCancelSkip = () => {
    // Dialog will close automatically
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      logger.error('Failed to sign in', error, 'Home')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowProfileMenu(false)
    } catch (error) {
      logger.error('Failed to sign out', error, 'Home')
    }
  }

  const navigationCards = [
    {
      title: 'Programs',
      description: 'Manage your workout programs',
      icon: RefreshCw,
      onClick: onNavigateToPrograms,
      color: 'bg-blue-500',
    },
    {
      title: 'Routines',
      description: 'Manage your workout routines',
      icon: ScrollText,
      onClick: onNavigateToRoutines,
      color: 'bg-indigo-500',
    },
    {
      title: 'Exercise Types',
      description: 'Browse and manage exercise types',
      icon: PersonStanding,
      onClick: onNavigateToExerciseTypes,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto p-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gym Tracker</h1>
            <p className="text-[hsl(var(--color-muted-foreground))]">
              Track your workout progress
            </p>
          </div>
          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {user.user_metadata?.avatar_url && (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={user.user_metadata?.full_name || 'User'}
                      className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setShowProfileMenu(true)}
                    />
                  )}
                </>
              ) : (
                <Button
                  onClick={handleSignIn}
                  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in with Google
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {activeSession && onResumeWorkout ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-1">
                  Workout in progress
                </p>
                <h2 className="text-2xl font-bold mb-1">Resume Workout</h2>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  Started {new Date(activeSession.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button
                  size="lg"
                  onClick={onResumeWorkout}
                  className="h-14 gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 animate-pulse"
                >
                  <Pause className="h-5 w-5" fill="currentColor" />
                  Resume Workout
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : nextRoutine && onStartWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] mb-1">
                  Next workout
                </p>
                <h2 className="text-2xl font-bold mb-1">{nextRoutine.name}</h2>
                {currentProgram && (
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                    from {currentProgram.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button
                  size="lg"
                  onClick={onStartWorkout}
                  className="h-14 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                >
                  <Play className="h-5 w-5" fill="currentColor" />
                  Start Workout
                </Button>
                {onSkipWorkout && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleSkipClick}
                    className="h-12 gap-2"
                  >
                    <SkipForward className="h-5 w-5" />
                    Skip Workout
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {navigationCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 24
            }}
          >
            <Card
              className="h-full p-8 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
              onClick={card.onClick}
            >
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${card.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <card.icon className={`h-8 w-8 text-current`} />
                </div>
                <h2 className="text-2xl font-bold mb-2">{card.title}</h2>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  {card.description}
                </p>
              </div>
              <div className={`absolute inset-0 ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </Card>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showSkipConfirmation}
        onOpenChange={setShowSkipConfirmation}
        title="Skip Workout"
        description={`Are you sure you want to skip "${nextRoutine?.name}"? This will move to the next workout in your program.`}
        confirmText="Skip"
        cancelText="Cancel"
        onConfirm={handleConfirmSkip}
        onCancel={handleCancelSkip}
        variant="default"
        showWarningIcon={false}
      />

      <Drawer.Root open={showProfileMenu} onOpenChange={setShowProfileMenu}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[var(--z-drawer-overlay)]" style={{ '--z-drawer-overlay': Z_INDEX.DRAWER_OVERLAY } as React.CSSProperties} />
          <Drawer.Content className="bg-[hsl(var(--color-background))] flex flex-col rounded-t-[10px] h-auto mt-24 fixed bottom-0 left-0 right-0 z-[var(--z-drawer-content)]" style={{ '--z-drawer-content': Z_INDEX.DRAWER_CONTENT } as React.CSSProperties}>
            <div className="p-6 bg-[hsl(var(--color-background))] rounded-t-[10px]">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-[hsl(var(--color-muted))] mb-6" />

              <Drawer.Title className="sr-only">Profile Menu</Drawer.Title>
              <Drawer.Description className="sr-only">
                Account options and sign out
              </Drawer.Description>

              <div className="flex flex-col items-center gap-4 mb-6">
                {user?.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || 'User'}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                {user?.user_metadata?.full_name && (
                  <h3 className="text-xl font-semibold">{user.user_metadata.full_name}</h3>
                )}
                {user?.email && (
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))]">{user.email}</p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full gap-2"
                size="lg"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
