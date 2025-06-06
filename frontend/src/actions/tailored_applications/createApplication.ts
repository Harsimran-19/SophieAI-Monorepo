import { revalidatePath } from "next/cache"

import type { ApplicationStatus, Company, Job } from "@/types/application"

import { createClient } from "@/lib/supabase/server"

interface CreateApplicationPayload {
  resumeId: string
  jobTitle: string
  jobDescription: string
  jobUrl?: string
  companyName: string
  companyDescription?: string
  shouldTailorResume?: boolean
  generateCoverLetter?: boolean
}

// Updated to include processing status
export type DocumentStatus = "pending" | "processing" | "completed" | "failed"

interface DocumentGenerationPayload {
  applicationId: string
  resumeId: string
  jobDescription: string
  generateCoverLetter: boolean
  shouldTailorResume: boolean
}

// Mock function to simulate document generation API call
async function triggerDocumentGeneration(payload: DocumentGenerationPayload) {
  // In a real implementation, this would be an API endpoint that triggers
  // a background job (e.g., using Bull, AWS Lambda, etc.)
  try {
    // Simulate API call to queue the job
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      success: true,
      jobId: crypto.randomUUID(), // In real implementation, this would be the background job ID
      message: "Document generation queued successfully",
    }
  } catch (error) {
    console.error("Error triggering document generation:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to queue document generation",
    }
  }
}

export async function createApplication(payload: CreateApplicationPayload) {
  console.log("🏁 Starting createApplication...")
  const supabase = createClient()

  try {
    // 1. Authenticate user
    console.log("🔐 Authenticating user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError)
      throw new Error("User not authenticated")
    }
    console.log("✅ User authenticated:", user.id)

    // 2. Upsert company
    console.log("🏢 Checking if company exists:", payload.companyName)
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("name", payload.companyName)
      .maybeSingle()

    if (companyError) {
      console.error("❌ Error checking company:", companyError)
      throw new Error(`Error checking company: ${companyError.message}`)
    }

    let company: Company
    if (!existingCompany) {
      console.log("📝 Creating new company...")
      const { data: newCompany, error: insertCompanyError } = await supabase
        .from("companies")
        .insert({
          name: payload.companyName,
          description: payload.companyDescription,
        })
        .select("*")
        .single()

      if (insertCompanyError || !newCompany) {
        console.error("❌ Error creating company:", insertCompanyError)
        throw new Error(
          `Error inserting company: ${insertCompanyError?.message}`
        )
      }
      company = newCompany as Company
      console.log("✅ New company created:", company.id)
    } else {
      company = existingCompany as Company
      console.log("✅ Using existing company:", company.id)
    }

    // 3. Insert job
    console.log("💼 Creating job record...")
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        company_id: company.id,
        job_title: payload.jobTitle,
        job_description: payload.jobDescription,
        job_url: payload.jobUrl,
      })
      .select("*")
      .single()

    if (jobError || !job) {
      console.error("❌ Error creating job:", jobError)
      throw new Error(`Error inserting job: ${jobError?.message}`)
    }
    console.log("✅ Job created:", job.id)

    // 4. Create initial application
    const initialStatus: ApplicationStatus =
      payload.shouldTailorResume || payload.generateCoverLetter
        ? "In Progress"
        : "Completed"

    console.log("📄 Creating application with status:", initialStatus)
    const { data: application, error: appError } = await supabase
      .from("tailored_applications")
      .insert({
        user_id: user.id,
        resume_id: payload.resumeId,
        job_id: job.id,
        company_id: company.id,
        status: initialStatus,
        applied_date: new Date().toISOString(),
      })
      .select(
        `
        *,
        job:jobs(*),
        company:companies(*)
      `
      )
      .single()

    if (appError || !application) {
      console.error("❌ Error creating application:", appError)
      throw new Error(`Error inserting application: ${appError?.message}`)
    }
    console.log("✅ Application created:", application.id)

    // 5. Trigger document generation if needed
    if (payload.shouldTailorResume || payload.generateCoverLetter) {
      console.log("🔄 Triggering document generation...")
      const { success, jobId, error } = await triggerDocumentGeneration({
        applicationId: application.id,
        resumeId: payload.resumeId,
        jobDescription: payload.jobDescription,
        generateCoverLetter: payload.generateCoverLetter || false,
        shouldTailorResume: payload.shouldTailorResume || false,
      })

      if (!success) {
        console.error("❌ Document generation failed:", error)
        // Update application with error status
        const { error: updateError } = await supabase
          .from("tailored_applications")
          .update({
            status: "Failed" as const,
            notes: `Failed to queue document generation: ${error}`,
          })
          .eq("id", application.id)
          .select(
            `
            *,
            job:jobs(*),
            company:companies(*)
          `
          )
          .single()

        if (updateError) {
          console.error("❌ Failed to update application status:", updateError)
        }
      } else {
        console.log("✅ Document generation queued:", jobId)
        // Add job ID to notes for tracking
        const { error: updateError } = await supabase
          .from("tailored_applications")
          .update({
            notes: `Document generation job queued. Job ID: ${jobId}`,
          })
          .eq("id", application.id)
          .select(
            `
            *,
            job:jobs(*),
            company:companies(*)
          `
          )
          .single()

        if (updateError) {
          console.error("❌ Failed to update application notes:", updateError)
        }
      }
    }

    // 6. Revalidate and return
    console.log("🔄 Revalidating page...")
    revalidatePath("/applications")

    console.log("✅ All done! Returning success response")
    return {
      success: true,
      data: {
        application: {
          ...application,
          job: job as Job,
          company: company as Company,
        },
        message:
          initialStatus === "Completed"
            ? "Application created successfully."
            : "Application created successfully. Document generation has been queued.",
      },
    }
  } catch (error) {
    console.error("❌ Error in createApplication:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}
