/**
 * Centralized auth logic (signup, signin, signout)
 */

import {
  AuthError,
  type Session,
  type User as SupabaseUser,
} from "@supabase/supabase-js"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

// Input validation schemas
export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Types
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

export interface AuthResponse {
  success: boolean
  data?: {
    user: SupabaseUser | null
    session: Session | null
  }
  error?: string
}

/**
 * Sign up a new user and create their profile
 */
export async function signUp({
  email,
  password,
  firstName,
  lastName,
}: SignUpInput): Promise<AuthResponse> {
  try {
    // Validate input
    const validatedInput = signUpSchema.parse({
      email,
      password,
      firstName,
      lastName,
    })

    const supabase = createClient()

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: validatedInput.email,
      password: validatedInput.password,
      options: {
        data: {
          first_name: validatedInput.firstName,
          last_name: validatedInput.lastName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email: data.user.email!,
          first_name: validatedInput.firstName,
          last_name: validatedInput.lastName,
        },
      ])

      if (profileError) {
        // Log error but don't fail the signup
        console.error("Error creating user profile:", profileError)
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      }
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({
  email,
  password,
}: SignInInput): Promise<AuthResponse> {
  try {
    // Validate input
    const validatedInput = signInSchema.parse({ email, password })

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedInput.email,
      password: validatedInput.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input data",
      }
    }

    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: {
        user: null,
        session: null,
      },
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
