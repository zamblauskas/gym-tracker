import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { logger } from '@/lib/utils/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error', error, 'ErrorBoundary')
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    })
    // Reload the page to reset the app state
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--color-background))]">
          <Card className="max-w-md w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-[hsl(var(--color-destructive))]">
                Something went wrong
              </h1>
              <p className="text-[hsl(var(--color-muted-foreground))]">
                The application encountered an unexpected error.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[hsl(var(--color-muted))] rounded-md">
                <p className="text-sm font-mono text-[hsl(var(--color-foreground))] break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button
                onClick={this.handleReset}
                className="w-full"
              >
                Return to Home
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-center text-[hsl(var(--color-muted-foreground))]">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
