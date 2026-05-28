import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-border bg-card p-4">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Open DevTools Console for the full stack trace.
            </p>
            <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-xs">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm hover:bg-accent"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

