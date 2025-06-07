import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  GraduationCap,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"

import type { Education } from "@/types/resume-content"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface EducationSectionProps {
  education: Education[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export function EducationSection({
  education,
  onAdd,
  onUpdate,
  onRemove,
}: EducationSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <GraduationCap className="size-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">
              EDUCATION
            </span>
          </div>
          <div className="flex items-center gap-2">
            {open ? (
              <ChevronUp className="size-4 text-gray-600" />
            ) : (
              <ChevronDown className="size-4 text-gray-600" />
            )}
            <Eye className="size-4 text-gray-600" />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-4 space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id} className="border-l-4 border-orange-500 pl-4">
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
                  Education
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(edu.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    School
                  </Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => onUpdate(edu.id, "school", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Degree
                  </Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => onUpdate(edu.id, "degree", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Start Date
                    </Label>
                    <Input
                      value={edu.startDate}
                      onChange={(e) =>
                        onUpdate(edu.id, "startDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      End Date
                    </Label>
                    <Input
                      value={edu.endDate}
                      onChange={(e) =>
                        onUpdate(edu.id, "endDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    GPA
                  </Label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => onUpdate(edu.id, "gpa", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      Coursework
                    </Label>
                  </div>

                  <Textarea
                    value={edu.coursework}
                    onChange={(e) =>
                      onUpdate(edu.id, "coursework", e.target.value)
                    }
                    className="mt-1"
                    rows={4}
                    placeholder="Use commas to separate courses (e.g. Data Structures, Algorithms, Computer Architecture)"
                  />

                  {/* Bullets Preview */}
                  {edu.coursework &&
                    edu.coursework.split("\n").filter(Boolean).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {edu.coursework
                          .split("\n")
                          .filter(Boolean)
                          .map((bullet, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm text-gray-800"
                            >
                              <span className="mt-0.5 text-gray-400">•</span>
                              <span>{bullet}</span>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={onAdd}
            variant="outline"
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
          >
            <Plus className="mr-2 size-4" />
            Add Education
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
