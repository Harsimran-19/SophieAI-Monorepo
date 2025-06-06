import { cache } from "react"
import { type User as SupabaseUser } from "@supabase/supabase-js"

import { AuthError, type UserProfile } from "@/types/user"

import { createClient } from "@/lib/supabase/server"

// Cache the getUser function to avoid unnecessary database calls
export const getUser = cache(async (): Promise<SupabaseUser | null> => {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error fetching user:", error)
      throw new AuthError(error.message)
    }

    return user
  } catch (error) {
    console.error("Unexpected error in getUser:", error)
    throw error instanceof AuthError
      ? error
      : new AuthError("Failed to fetch user")
  }
})

// Get both user and profile data
export const getUserWithProfile = cache(
  async (): Promise<any | null> => {
    try {
      const supabase = createClient()

      // Get user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw new AuthError(userError.message)
      if (!user) return null

      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        // Don't throw here - profile might not exist yet
      }

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        profile: profile as UserProfile | null,
      }
    } catch (error) {
      console.error("Error in getUserWithProfile:", error)
      throw error instanceof AuthError
        ? error
        : new AuthError("Failed to fetch user data")
    }
  }
)
