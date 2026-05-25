export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function parseErrorMessage(data: Record<string, unknown>, status: number): string {
  if (typeof data.message === 'string' && data.message && data.message !== 'HTTPError') {
    return data.message
  }
  if (typeof data.statusMessage === 'string' && data.statusMessage !== 'HTTPError') {
    return data.statusMessage
  }
  if (status === 503) return 'Service unavailable. Check database configuration in .env'
  if (status === 401) return 'Invalid email or password'
  if (status === 409) return 'Email already registered'
  return 'Request failed'
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Cannot reach server. Is npm run dev running?')
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new ApiError(res.status, parseErrorMessage(data, res.status))
  }
  return data as T
}

export const api = {
  auth: {
    me: () => request<{ user: User }>('/api/auth/me'),
    login: (body: { email: string; password: string }) =>
      request<{ user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: { email: string; name: string; password: string }) =>
      request<{ user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
    forgotPassword: (body: { email: string }) =>
      request<{ message: string; resetLink?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    resetPassword: (body: { token: string; password: string }) =>
      request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  workouts: {
    list: () => request<{ workouts: WorkoutSummary[] }>('/api/workouts'),
    get: (id: string) => request<{ workout: WorkoutDetail; totalVolume: number }>(`/api/workouts/${id}`),
    last: () => request<{ workout: WorkoutDetail | null }>('/api/workouts/last'),
    create: (body: CreateWorkoutPayload) =>
      request<{ workout: WorkoutDetail }>('/api/workouts', { method: 'POST', body: JSON.stringify(body) }),
  },
}

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface WorkoutSummary {
  id: string
  date: string
  title: string
  notes: string | null
  durationMinutes: number | null
  completedAt: string | null
  createdAt: string
}

export interface SetData {
  setNumber: number
  reps: number | null
  weight: number | null
  weightUnit: string
  rpe: number | null
  notes: string | null
}

export interface ExerciseData {
  id?: string
  name: string
  sortOrder: number
  sets: SetData[]
}

export interface WorkoutDetail {
  id: string
  date: string
  title: string
  notes: string | null
  durationMinutes: number | null
  startedAt: string | null
  completedAt: string | null
  exercises: ExerciseData[]
}

export interface CreateWorkoutPayload {
  title: string
  notes?: string | null
  date: string
  durationMinutes?: number | null
  startedAt?: string | null
  completedAt?: string | null
  exercises: {
    name: string
    sortOrder: number
    sets: {
      setNumber: number
      reps?: number | null
      weight?: number | null
      weightUnit: string
      rpe?: number | null
      notes?: string | null
    }[]
  }[]
}

export const DRAFT_KEY = 'workout-draft'
export const WEIGHT_UNIT_KEY = 'weight-unit'

export type DraftWorkout = {
  title: string
  notes: string
  startedAt: string
  exercises: {
    name: string
    sortOrder: number
    sets: { setNumber: number; reps: string; weight: string; rpe: string; notes: string }[]
  }[]
}
