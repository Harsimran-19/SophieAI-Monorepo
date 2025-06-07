import type { Resume, TailoredResume } from "@/types/resume"

import { createClient } from "@/lib/supabase/server"

/**
 * Get all resumes for a user
 * @param userId - The ID of the user
 * @param orderBy - The field to order by
 * @returns An array of resumes
 */
export async function getResumes(
  userId: string,
  orderBy: string = "created_at"
): Promise<Resume[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order(orderBy, { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Get a resume by its ID
 * @param id - The ID of the resume
 * @returns The resume
 */
export async function getResumeById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data || null
}

/**
 * Get all tailored resumes for a user
 * @param userId - The ID of the user
 * @param orderBy - The field to order by
 * @returns An array of tailored resumes
 */
export async function getTailoredResumes(
  userId: string,
  orderBy: string = "created_at"
): Promise<TailoredResume[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("user_id", userId)
    .order(orderBy, { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

/**
 * Get a tailored resume by its ID
 * @param id - The ID of the tailored resume
 * @returns The tailored resume
 */
export async function getTailoredResumeById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data || null
}

/**
 * Get a tailored resume by its original resume ID
 * @param originalResumeId - The ID of the original resume
 * @returns The tailored resume
 */
export async function getTailoredResumeByOriginalResumeId(
  originalResumeId: string
) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("original_resume_id", originalResumeId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data || null
}

/**
 * Search for resumes by title
 * @param userId - The ID of the user
 * @param query - The search query
 * @returns An array of resumes
 */
export async function searchResumes(
  userId: string,
  query: string,
  {
    sort = "created_at",
    asc = false,
    limit = 20,
  }: { sort?: string; asc?: boolean; limit?: number } = {}
): Promise<Resume[]> {
  const supabase = createClient()

  let builder = supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order(sort, { ascending: asc })
    .limit(limit)

  if (query.trim()) {
    builder = builder.ilike("title", `%${query.trim()}%`)
  }

  const { data, error } = await builder

  if (error) {
    console.error("Search error:", error)
    throw new Error("Failed to search resumes")
  }

  return data || []
}
