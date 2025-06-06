"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  Sparkles,
  Wrench,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SkillSectionProps {
  skills: string
  onAdd: (skill: string) => void
  onRemove: (skill: string) => void
  onUpdate?: (skills: string) => void
}

export function SkillSection({
  skills,
  onAdd,
  onRemove,
  onUpdate,
}: SkillSectionProps) {
  const [open, setOpen] = useState(true)
  const [newSkill, setNewSkill] = useState("")

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    onAdd(newSkill.trim())
    setNewSkill("")
  }

  const handleBulkUpdate = (value: string) => {
    if (onUpdate) {
      onUpdate(value)
    }
  }

  const skillsList = skills ? skills.split("\n").filter(Boolean) : []

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <Wrench className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">SKILLS</span>
          </div>
          <div className="flex items-center gap-2">
            {open ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
            <Eye className="h-4 w-4 text-gray-600" />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-4 space-y-6">
          <div className="border-l-4 border-orange-500 pl-4">
            {/* Description/Bulk Edit */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Skills Description
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">≡ Live Bullets</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Generate
                  </Button>
                </div>
              </div>

              <Textarea
                value={skills}
                onChange={(e) => handleBulkUpdate(e.target.value)}
                className="mt-1"
                rows={4}
                placeholder="Use line breaks for each skill (e.g. Technical Skills: TypeScript, React ↵Database: PostgreSQL, MongoDB↵)"
              />

              {/* Skills Preview */}
              {skillsList.length > 0 && (
                <div className="mt-3 space-y-1">
                  {skillsList.map((skill, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-800"
                    >
                      <span className="mt-0.5 text-gray-400">•</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
