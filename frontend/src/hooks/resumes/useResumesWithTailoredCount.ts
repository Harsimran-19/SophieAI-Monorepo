import { useCallback, useEffect, useState } from "react"

import type { Resume } from "@/types/resume"

import { createClient } from "@/lib/supabase/client"

export const useResumesWithTailoredCount = () => {
  const [data, setData] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  const fetchResumesWithTailoredCount = useCallback(async () => {
    try {
      setLoading(true)
      const { data: resumes, error } = await supabase
        .from("resumes_with_tailored_count")
        .select("*")

      if (error) throw error

      setData(resumes)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void fetchResumesWithTailoredCount()
  }, [fetchResumesWithTailoredCount])

  const refresh = () => {
    void fetchResumesWithTailoredCount()
  }

  return {
    resumes: data,
    loading,
    error,
    refresh,
  }
}
