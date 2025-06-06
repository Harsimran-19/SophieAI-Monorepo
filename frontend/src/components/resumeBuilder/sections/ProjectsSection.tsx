import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Eye,
  FolderGit2,
  Plus,
  Trash2,
} from "lucide-react"

import type { Project } from "@/types/resume-content"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BulletTextarea } from "@/components/resumeBuilder/BulletTextarea"

interface ProjectsSectionProps {
  projects: Project[]
  onAdd: () => void
  onUpdate: (id: string, field: string, value: string) => void
  onRemove: (id: string) => void
}

export function ProjectsSection({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}: ProjectsSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <FolderGit2 className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">
              PROJECTS
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
          {projects.map((project, index) => (
            <div key={project.id} className="border-l-4 border-orange-500 pl-4">
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
                  Project
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Project Name
                  </Label>
                  <Input
                    value={project.name}
                    onChange={(e) =>
                      onUpdate(project.id, "name", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Affiliation
                  </Label>
                  <Input
                    value={project.affiliation}
                    onChange={(e) =>
                      onUpdate(project.id, "affiliation", e.target.value)
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
                      value={project.startDate}
                      onChange={(e) =>
                        onUpdate(project.id, "startDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      End Date
                    </Label>
                    <Input
                      value={project.endDate}
                      onChange={(e) =>
                        onUpdate(project.id, "endDate", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <BulletTextarea
                  value={project.description}
                  onChange={(value) =>
                    onUpdate(project.id, "description", value)
                  }
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
            Add Project
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
