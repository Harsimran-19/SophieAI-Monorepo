"use server"

import { revalidatePath } from "next/cache"

import {
  signInWithPasswordSchema,
  type SignInWithPasswordFormInput,
} from "@/validations/auth"

import { createClient } from "@/lib/supabase/server"

/**
 * Sign in with password
 * @param rawInput - The raw input to sign in with password
 * @returns The result of the sign in with password
 */
export async function signInWithPassword(
  rawInput: SignInWithPasswordFormInput
): Promise<
  | "invalid-input"
  | "invalid-credentials"
  | "error"
  | "success"
  | "unverified-email"
  | "onboarding"
> {
  try {
    const validatedInput = signInWithPasswordSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: validatedInput.data.email,
      password: validatedInput.data.password,
    })

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return "invalid-credentials"
      }
      return "error"
    }

    if (user) {
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single()

      if (profileError || !profile) {
        return "error"
      }

      // If profile exists but fields are incomplete (e.g., added signup manually)
      if (!profile.first_name || !profile.last_name) {
        return "onboarding"
      }
    }

    revalidatePath("/", "layout")
    return "success"
  } catch (err) {
    console.error(err)
    return "error"
  }
}
