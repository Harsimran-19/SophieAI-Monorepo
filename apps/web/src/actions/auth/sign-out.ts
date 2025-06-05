"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

export interface SignOutResult {
  success: boolean
  error?: string
}

/**
 * Signs out the current user by:
 * 1. Clearing the Supabase auth session
 * 2. Clearing cookies
 * 3. Revalidating all pages
 * 4. Redirecting to the sign-in page
 *
 * @returns A promise that resolves to the sign-out result
 */
export async function signOut(): Promise<SignOutResult> {
  try {
    const supabase = await createClient()

    // Clear the auth session
    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
      console.error("Sign out error:", signOutError)
      return {
        success: false,
        error: "Failed to sign out",
      }
    }

    // Clear cookies
    cookies().delete("sb-access-token")
    cookies().delete("sb-refresh-token")

    // Revalidate all pages that might show user data
    revalidatePath("/", "layout")

    // Redirect to sign in page
    redirect("/signin")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
