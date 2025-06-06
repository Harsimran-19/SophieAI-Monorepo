import { useCallback, useEffect, useState } from "react"
import debounce from "lodash/debounce"
import { ChevronDown, ChevronUp, Eye, Sparkles, User } from "lucide-react"

import type { PersonalInfo } from "@/types/resume-content"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo
  objective: string
  onChange: (field: string, value: string) => void
  onUpdateObjective: (value: string) => void
}

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500

export function PersonalInfoSection({
  personalInfo,
  objective,
  onChange,
  onUpdateObjective,
}: PersonalInfoSectionProps) {
  const [open, setOpen] = useState(true)
  const [localInfo, setLocalInfo] = useState(personalInfo)
  const [localObjective, setLocalObjective] = useState(objective)

  // Update local state when props change
  useEffect(() => {
    setLocalInfo(personalInfo)
  }, [personalInfo])

  useEffect(() => {
    setLocalObjective(objective)
  }, [objective])

  // Create debounced update functions
  const debouncedOnChange = useCallback(
    debounce((field: string, value: string) => {
      onChange(field, value)
    }, DEBOUNCE_DELAY),
    [onChange]
  )

  const debouncedOnUpdateObjective = useCallback(
    debounce((value: string) => {
      onUpdateObjective(value)
    }, DEBOUNCE_DELAY),
    [onUpdateObjective]
  )

  // Handle local state updates with debounced prop updates
  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setLocalInfo((prev) => ({ ...prev, [field]: value }))
      debouncedOnChange(field, value)
    },
    [debouncedOnChange]
  )

  const handleObjectiveChange = useCallback(
    (value: string) => {
      setLocalObjective(value)
      debouncedOnUpdateObjective(value)
    },
    [debouncedOnUpdateObjective]
  )

  // Cleanup debounced functions
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel()
      debouncedOnUpdateObjective.cancel()
    }
  }, [debouncedOnChange, debouncedOnUpdateObjective])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 hover:bg-gray-100">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-lg font-semibold text-gray-900">
              PERSONAL INFORMATION
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
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </Label>
              <Input
                id="name"
                value={localInfo.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700"
              >
                Location
              </Label>
              <Input
                id="location"
                value={localInfo.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone
              </Label>
              <Input
                id="phone"
                value={localInfo.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                value={localInfo.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="website"
              className="text-sm font-medium text-gray-700"
            >
              Website
            </Label>
            <Input
              id="website"
              value={localInfo.website || ""}
              onChange={(e) => handleFieldChange("website", e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label
                htmlFor="objective"
                className="text-sm font-medium text-gray-700"
              >
                Objective
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                AI Generate
              </Button>
            </div>
            <Textarea
              id="objective"
              value={localObjective}
              onChange={(e) => handleObjectiveChange(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
