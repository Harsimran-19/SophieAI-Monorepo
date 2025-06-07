"use server"

import { revalidatePath } from "next/cache"

import { onboardingSchema, type OnboardingFormInput } from "@/validations/user"

import { createClient } from "@/lib/supabase/server"

export interface UpdateProfileResult {
  success: boolean
  error?: string
}

/**
 * Updates a user's profile with their first and last name
 * @param formData - The form data containing first and last name
 * @param userId - The ID of the user to update
 * @returns A promise that resolves to the update result
 */
export async function updateProfile(
  formData: OnboardingFormInput,
  userId: string
): Promise<UpdateProfileResult> {
  try {
    // Validate userId
    if (!userId) {
      return {
        success: false,
        error: "User ID is required",
      }
    }

    // Validate form data
    const validated = onboardingSchema.safeParse(formData)
    if (!validated.success) {
      return {
        success: false,
        error: "Invalid input data",
      }
    }

    const supabase = await createClient()

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: validated.data.firstName,
        last_name: validated.data.lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return {
        success: false,
        error: "Failed to update profile",
      }
    }

    // Revalidate all pages that might show the user's name
    revalidatePath("/", "layout")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Unexpected error during profile update:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
