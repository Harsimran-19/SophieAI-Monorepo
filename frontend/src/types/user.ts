import { type User as SupabaseUser } from "@supabase/supabase-js"

export interface User {
  id: string // UUID
  email: string
  created_at: string // ISO timestamp
}

export interface UserProfile {
  id: string // UUID, also FK to users.id
  first_name: string
  last_name: string
  avatar_url?: string // Nullable
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

// Auth context type
export interface AuthState {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  error: Error | null
}

// Auth error type
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}
