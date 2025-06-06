import { Calendar, Filter, Search, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TailorActionBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onNewRequestClick: () => void
}

export function TailorActionBar({
  searchQuery,
  setSearchQuery,
  onNewRequestClick,
}: TailorActionBarProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="default" onClick={onNewRequestClick}>
          <Sparkles className="mr-2 size-4" />
          New Request
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 size-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 size-4" />
          Date
        </Button>
      </div>
    </div>
  )
}
