import { Link, useLocation, Outlet } from 'react-router-dom'
import { Dumbbell, History, Home, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/workout/new', icon: Dumbbell, label: 'Log' },
]

export function Layout({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const { user, logout } = useAuth()

  const hideNav = location.pathname.startsWith('/workout/new')

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Workout Tracker</p>
            <p className="font-semibold">{user?.name}</p>
          </div>
          <button
            onClick={() => logout()}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4">
        {children ?? <Outlet />}
      </main>

      {!hideNav && (
        <nav className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
            {nav.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-xl px-3 text-xs font-medium transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
