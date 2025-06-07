"use server"

import { revalidatePath } from "next/cache"
import { getUserProfile } from "@/actions/user"

import type {
  AwardEntry,
  CertificateEntry,
  DatabaseEntry,
  EducationEntry,
  ExperienceEntry,
  ParsedResume,
  PersonalEntry,
  ProjectEntry,
} from "@/types/resumeParsed"
import type { UserProfile, UserProfileResponse } from "@/types/user-profile"

import { downloadResume } from "@/lib/resumeUtils"
import { createClient } from "@/lib/supabase/server"
import { parseAndFormatDate } from "@/lib/utils/dateUtils"

export const fetchResume = async (profile: UserProfile) => {
  const {
    success: downloadSuccess,
    data: fileData,
    error: downloadError,
  } = await downloadResume(profile.resume_id)

  if (!downloadSuccess || !fileData) {
    throw new Error(downloadError || "Failed to download resume")
  }
}

const toSnakeCase = <T extends Record<string, unknown>>(
  data: T
): Partial<DatabaseEntry> => {
  const converted: Record<string, unknown> = {}
  Object.keys(data).forEach((key) => {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    )

    // Handle date fields
    if (snakeKey.endsWith("_date")) {
      converted[snakeKey] = parseAndFormatDate(data[key] as string)
    } else {
      converted[snakeKey] = data[key]
    }
  })
  return converted
}

/**
 * Saves entries to the database (helper function for saveResumeData)
 * @param tableName - The name of the table to save the entries to
 * @param entries - The entries to save
 * @param userId - The user ID of the entries
 * @param resumeId - The resume ID of the entries
 */
async function saveEntries(
  tableName: string,
  entries:
    | EducationEntry[]
    | ExperienceEntry[]
    | ProjectEntry[]
    | CertificateEntry[]
    | AwardEntry[]
    | PersonalEntry[],
  userId: string,
  resumeId: string
) {
  // Delete existing entries
  const supabase = createClient()
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq("user_id", userId)

  if (deleteError) {
    throw new Error(
      `Failed to delete existing ${tableName}: ${deleteError.message}`
    )
  }

  // Insert new entries if there are any
  if (entries.length > 0) {
    const { error: insertError } = await supabase.from(tableName).insert(
      entries.map((entry) => ({
        ...toSnakeCase(entry as unknown as Record<string, unknown>),
        user_id: userId,
        resume_id: resumeId,
        created_at: new Date().toISOString(),
      }))
    )

    if (insertError) {
      throw new Error(`Failed to insert ${tableName}: ${insertError.message}`)
    }
  }
}

/**
 * Saves the resume data to the database
 * @param resumeData - The resume data to save
 * @returns The result of the save operation
 */
export async function saveResumeData(resumeData: ParsedResume) {
  if (!resumeData) {
    return {
      success: false,
      error: "No resume data provided",
    }
  }

  console.log("Resume data structure:", JSON.stringify(resumeData, null, 2))

  // Add validation
  if (!resumeData.Personal) {
    return {
      success: false,
      error: "Invalid resume data structure - missing Personal section",
    }
  }

  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ Auth Error:", userError)
      return {
        success: false,
        error: `Authentication error: ${userError?.message || "User not found"}`,
      }
    }

    // Get user profile to get resume_id
    const profile: UserProfileResponse = await getUserProfile()
    if (!profile.success || !profile.data?.resume_id) {
      return {
        success: false,
        error: "Resume ID not found in user profile",
      }
    }

    console.log(
      "👤 Attempting save for user:",
      user.id,
      "resume:",
      profile.data.resume_id
    )

    try {
      // Save all entry types
      if (resumeData.Personal?.data) {
        await saveEntries(
          "personal_entries",
          resumeData.Personal.data,
          user.id,
          profile.data.resume_id
        )
      }

      await saveEntries(
        "education_entries",
        resumeData.Education.data,
        user.id,
        profile.data.resume_id
      )

      await saveEntries(
        "experience_entries",
        resumeData.Experience.data,
        user.id,
        profile.data.resume_id
      )

      await saveEntries(
        "project_entries",
        resumeData.Projects.data,
        user.id,
        profile.data.resume_id
      )

      await saveEntries(
        "certificate_entries",
        resumeData.Certificates.data,
        user.id,
        profile.data.resume_id
      )

      await saveEntries(
        "award_entries",
        resumeData.Awards.data,
        user.id,
        profile.data.resume_id
      )
    } catch (dbError) {
      console.error("❌ Database operation failed:", dbError)
      return {
        success: false,
        error:
          dbError instanceof Error
            ? dbError.message
            : "Database operation failed",
      }
    }

    console.log("✅ Data saved successfully")
    revalidatePath("/dashboard/resumeBuilder/edit")
    return { success: true }
  } catch (error) {
    console.error("❌ Save Error:", error)
    return {
      success: false,
      error: `Save operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
