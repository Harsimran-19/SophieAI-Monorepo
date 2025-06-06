"use client"

import { FileText, Filter, Target } from "lucide-react"

import type { DocumentFilter, DocumentStatus } from "@/types/resume"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DocumentFiltersProps {
  filter: DocumentFilter
  onFilterChange: (filter: DocumentFilter) => void
  resumeCount: number
  tailoredCount: number
}

export function DocumentFilters({
  filter,
  onFilterChange,
  resumeCount,
  tailoredCount,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter.type === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ ...filter, type: "all" })}
          className="gap-2"
        >
          All Documents
          <Badge variant="secondary" className="ml-1">
            {resumeCount + tailoredCount}
          </Badge>
        </Button>
        <Button
          variant={filter.type === "resume" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ ...filter, type: "resume" })}
          className="gap-2"
        >
          <FileText className="h-3 w-3" />
          Base Resumes
          <Badge variant="secondary" className="ml-1">
            {resumeCount}
          </Badge>
        </Button>
        <Button
          variant={filter.type === "tailored" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ ...filter, type: "tailored" })}
          className="gap-2"
        >
          <Target className="h-3 w-3" />
          Tailored Resumes
          <Badge variant="secondary" className="ml-1">
            {tailoredCount}
          </Badge>
        </Button>
      </div>
    </div>
  )
}
