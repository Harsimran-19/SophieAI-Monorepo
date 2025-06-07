"use server"

import { revalidatePath } from "next/cache"

import {
  signUpWithPasswordSchema,
  type SignUpWithPasswordFormInput,
} from "@/validations/auth"

import { createClient } from "@/lib/supabase/server"

/**
 * Sign up with password
 * @param rawInput - The raw input to sign up with password
 * @returns The result of the sign up with password
 */
export async function signUpWithPassword(
  rawInput: SignUpWithPasswordFormInput
): Promise<"invalid-input" | "exists" | "error" | "success"> {
  try {
    const validatedInput = signUpWithPasswordSchema.safeParse(rawInput)
    if (!validatedInput.success) return "invalid-input"

    const supabase = await createClient()

    // Sign up user via Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedInput.data.email,
      password: validatedInput.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/signin`,
      },
    })

    if (authError || !authData.user) {
      console.error("SignUp error:", authError)
      return "error"
    }

    // Create matching profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: authData.user.id,
        first_name: "",
        last_name: "",
      },
    ])

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return "error"
    }

    revalidatePath("/", "layout")
    return "success"
  } catch (err) {
    console.error(err)
    return "error"
  }
}
