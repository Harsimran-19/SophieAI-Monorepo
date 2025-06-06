"use server"

import { revalidatePath } from "next/cache"

import {
  signInWithEmailSchema,
  type SignInWithEmailFormInput,
} from "@/validations/auth"

import { createClient } from "@/lib/supabase/server"

/**
    * Sign in with email
 * @param rawInput - The raw input to sign in with email
 * @returns The result of the sign in with email
 */
export async function signInWithEmail(
  rawInput: SignInWithEmailFormInput
): Promise<
  | "invalid-input"
  | "invalid-credentials"
  | "error"
  | "success"
  | "unverified-email"
  | "onboarding"
> {
  try {
    const validatedInput = signInWithEmailSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: validatedInput.data.email,
      password: "",
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
