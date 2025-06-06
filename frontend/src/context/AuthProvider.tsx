"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { type AuthError, type Session, type User } from "@supabase/supabase-js"

import type { UserProfile } from "@/types/user"

import { createClient } from "@/lib/supabase/client"

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

interface AuthContextValue extends AuthState {
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Custom hook to use auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  /**
   * Fetch the user profile from `profiles` table
   */
  const fetchProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) {
          console.error("Error fetching profile:", error.message)
          return null
        }

        return data as UserProfile
      } catch (error) {
        console.error("Unexpected error fetching profile:", error)
        return null
      }
    },
    [supabase]
  )

  /**
   * Refresh the session and profile
   */
  const refreshSession = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      const session = data.session
      const user = session?.user ?? null
      const profile = user ? await fetchProfile(user.id) : null

      setState({
        user,
        session,
        profile,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error refreshing session:", error)
      setState((prev) => ({
        ...prev,
        error: error as AuthError,
        loading: false,
      }))
    }
  }, [supabase, fetchProfile])

  /**
   * Sign out the user
   */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [supabase])

  /**
   * On mount, check session and listen for changes
   */
  useEffect(() => {
    let mounted = true

    void (async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!mounted) return

        const session = data.session
        const user = session?.user ?? null
        const profile = user ? await fetchProfile(user.id) : null

        setState({
          user,
          session,
          profile,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (!mounted) return
        console.error("Error getting initial session:", error)
        setState((prev) => ({
          ...prev,
          error: error as AuthError,
          loading: false,
        }))
      }
    })()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      try {
        const user = session?.user ?? null
        const profile = user ? await fetchProfile(user.id) : null

        setState({
          user,
          session,
          profile,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error in auth state change:", error)
        setState((prev) => ({
          ...prev,
          error: error as AuthError,
          loading: false,
        }))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const value = useMemo(
    () => ({
      ...state,
      refreshSession,
      signOut,
    }),
    [state, refreshSession, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
