import { useState } from "react"
import {
  Building,
  ChevronDown,
  ChevronUp,
  Eye,
  Plus,
  Trash2,
} from "lucide-react"

import type { Experience } from "@/types/resume-content"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BulletTextarea } from "@/components/resumeBuilder/BulletTextarea"

interface ExperienceSectionProps {
  experience: Experience[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export function ExperienceSection({
  experience,
  onAdd,
  onUpdate,
  onRemove,
}: ExperienceSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">
              WORK EXPERIENCE
            </span>
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
          {experience.map((exp, index) => (
            <div key={exp.id} className="border-l-4 border-orange-500 pl-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {index + 1}
                  {index === 0
                    ? "st"
                    : index === 1
                      ? "nd"
                      : index === 2
                        ? "rd"
                        : "th"}{" "}
                  Experience
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(exp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Company Name
                  </Label>
                  <Input
                    value={exp.company}
                    onChange={(e) =>
                      onUpdate(exp.id, "company", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Job Position
                  </Label>
                  <Input
                    value={exp.position}
                    onChange={(e) =>
                      onUpdate(exp.id, "position", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Start Date
                    </Label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) =>
                        onUpdate(exp.id, "startDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      End Date
                    </Label>
                    <Input
                      value={exp.endDate}
                      onChange={(e) =>
                        onUpdate(exp.id, "endDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <BulletTextarea
                  value={exp.description}
                  onChange={(value) => onUpdate(exp.id, "description", value)}
                />
              </div>
            </div>
          ))}

          <Button
            onClick={onAdd}
            variant="outline"
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Experience
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
