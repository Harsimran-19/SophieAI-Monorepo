"use server"

import {
  passwordResetSchema,
  type PasswordResetFormInput,
} from "@/validations/auth"

import { createClient } from "@/lib/supabase/server"

/**
 * Reset password
 * @param rawInput - The raw input to reset password
 * @returns The result of the reset password
 */
export async function resetPassword(
  rawInput: PasswordResetFormInput
): Promise<"invalid-input" | "not-found" | "error" | "success"> {
  try {
    const validatedInput = passwordResetSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedInput.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    )

    if (error) {
      if (error.message.includes("User not found")) {
        return "not-found"
      }
      return "error"
    }

    return "success"
  } catch (error) {
    console.error(error)
    return "error"
  }
}
