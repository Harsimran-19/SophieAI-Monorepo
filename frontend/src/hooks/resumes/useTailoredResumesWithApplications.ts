import { useCallback, useEffect, useState } from "react"

import type { TailoredResumeWithApplication } from "@/types/resume"

import { createClient } from "@/lib/supabase/client"

export const useTailoredResumesWithApplications = () => {
  const [data, setData] = useState<TailoredResumeWithApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchTailoredResumesWithApplications = useCallback(async () => {
    try {
      setLoading(true)
      const { data: tailoredResumes, error } = await supabase
        .from("tailored_resumes_with_application")
        .select("*")

      if (error) throw error

      setData(tailoredResumes)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void fetchTailoredResumesWithApplications()
  }, [fetchTailoredResumesWithApplications])

  const refresh = () => {
    void fetchTailoredResumesWithApplications()
  }

  return {
    tailoredResumesWithApplications: data,
    loading,
    error,
    refresh,
  }
}
