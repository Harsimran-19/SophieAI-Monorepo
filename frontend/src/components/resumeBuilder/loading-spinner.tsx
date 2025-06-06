"use client"

import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Loader2 className="size-5 animate-spin" />
      <span className="text-sm font-medium">Loading...</span>
    </div>
  )
}
