import { useEffect, useRef, useState } from "react"
import { getDescriptionAnalysis } from "@/actions/resumeActions"

import type { ExperienceEntry, ProjectEntry } from "@/types/resumeParsed"

interface BulletPointAnalysis {
  category: string
  original: string
  suggestion: string
  reasons: string[]
}

interface DescriptionAnalysis {
  section: string
  entry_id: string
  title: string
  bullet_advice: BulletPointAnalysis[]
}

export const useDescriptionAnalysis = (
  selectedSection: string | null,
  entries: (ExperienceEntry | ProjectEntry)[]
) => {
  const [analysisData, setAnalysisData] = useState<DescriptionAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const analysisCache = useRef<Record<string, DescriptionAnalysis[]>>({})

  useEffect(() => {
    if (!selectedSection || !entries.length) return

    const cacheKey = `${selectedSection}-${entries.map((e) => e.id).join("-")}`
    if (analysisCache.current[cacheKey]) {
      setAnalysisData(analysisCache.current[cacheKey])
      return
    }

    const fetchAnalysis = async () => {
      setIsLoading(true)
      try {
        const results = await Promise.all(
          entries.map((entry) =>
            getDescriptionAnalysis(
              selectedSection as "Experience" | "Projects",
              entry.id,
              "description" in entry ? entry.description : []
            )
          )
        )

        const validResults = results
                  .filter((r) => r.success && r.data)
                  .map((r) => r.data!) as DescriptionAnalysis[]
        
                setAnalysisData(validResults)
                analysisCache.current[cacheKey] = validResults
      } catch (error) {
        console.error("Error fetching description analysis:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalysis()
  }, [selectedSection, entries])

  return { analysisData, isLoading }
}
