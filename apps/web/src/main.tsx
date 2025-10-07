import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorProvider } from './contexts/ErrorContext'
import { ExercisesProvider } from './contexts/ExercisesContext'
import { RoutinesProvider } from './contexts/RoutinesContext'
import { ProgramsProvider } from './contexts/ProgramsContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { AppStateProvider } from './contexts/AppStateContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/globals.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ErrorProvider>
              <ExercisesProvider>
                <RoutinesProvider>
                  <ProgramsProvider>
                    <WorkoutProvider>
                      <AppStateProvider>
                        <App />
                      </AppStateProvider>
                    </WorkoutProvider>
                  </ProgramsProvider>
                </RoutinesProvider>
              </ExercisesProvider>
            </ErrorProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
