"use server"

import type { Application } from "@/types/application"

import { createClient } from "@/lib/supabase/server"

class ApplicationError extends Error {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message)
  }
}

/**
 * Fetches all applications for a specific user from the database
 * @returns Promise resolving to an array of applications
 * @throws {ApplicationError} When the applications cannot be fetched or user is invalid
 */
export async function fetchAllApplicationsByCurrentUser(): Promise<
  Application[]
> {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new ApplicationError("Failed to fetch user", authError)
    }

    const { data, error: applicationError } = await supabase
      .from("tailored_applications")
      .select(
        `
        *,
        job:jobs (
          id,
          job_title,
          job_description
        ),
        company:companies ( 
          id,
          name
        )
        `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (applicationError) {
      throw new ApplicationError(
        "Failed to fetch applications",
        applicationError
      )
    }

    if (!data) {
      return []
    }

    if (!Array.isArray(data)) {
      throw new ApplicationError(
        "Invalid data structure received",
        new Error("Invalid data structure received")
      )
    }

    const validApplications = data.filter((item): item is Application => {
      const isValid = isValidApplication(item)
      if (!isValid) {
        console.warn("Invalid application data found:", item)
      }

      return isValid
    })

    return validApplications
  } catch (error) {
    console.error("Error in fetchAllApplicationsByCurrentUser:", error)
    throw error instanceof ApplicationError
      ? error
      : new ApplicationError(
          "Unexpected error while fetching applications",
          error as Error
        )
  }
}

/**
 * Type guard to validate the application data structure
 * @param data - The data to validate
 * @returns boolean indicating if the data is a valid Application
 */
function isValidApplication(data: any): data is Application {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "string" &&
    typeof data.user_id === "string" &&
    typeof data.created_at === "string" &&
    typeof data.updated_at === "string" &&
    typeof data.status === "string" &&
    typeof data.resume_id === "string" &&
    typeof data.job_id === "string" &&
    typeof data.company_id === "string" &&
    typeof data.notes === "string" &&
    typeof data.job === "object" &&
    data.job !== null &&
    typeof data.job.id === "string" &&
    typeof data.job.job_title === "string" &&
    typeof data.job.job_description === "string" &&
    typeof data.company === "object" &&
    data.company !== null &&
    typeof data.company.id === "string" &&
    typeof data.company.name === "string"
  )
}
