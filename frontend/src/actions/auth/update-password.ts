"use server"

import {
  passwordUpdateSchemaExtended,
  type PasswordUpdateFormInputExtended,
} from "@/validations/auth"

import { createClient } from "@/lib/supabase/server"

/**
 * Update password
 * @param rawInput - The raw input to update password
 * @returns The result of the update password
 */
export async function updatePassword(
  rawInput: PasswordUpdateFormInputExtended
): Promise<"invalid-input" | "error" | "success"> {
  try {
    const validatedInput = passwordUpdateSchemaExtended.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password: validatedInput.data.password,
    })

    if (error) {
      return "error"
    }

    return "success"
  } catch (error) {
    console.error(error)
    return "error"
  }
}
