import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BulletTextareaProps {
  value: string
  onChange: (value: string) => void
  label?: string
  showAIButton?: boolean
  onAIGenerate?: () => void
}

export function BulletTextarea({
  value,
  onChange,
  label = "Description",
  showAIButton = true,
  onAIGenerate,
}: BulletTextareaProps) {
  // Local state for raw input
  const [localDescription, setLocalDescription] = useState("")

  // Initialize local state from props, removing bullets
  useEffect(() => {
    setLocalDescription(
      value
        ?.split("\n")
        .map((line) => line.replace(/^•\s*/, ""))
        .join("\n") || ""
    )
  }, [value])

  // Handle saving with bullet points
  const handleBlur = () => {
    const formattedValue = localDescription
      .split("\n")
      .map((line) => {
        const trimmed = line.trim()
        return trimmed ? `• ${trimmed}` : ""
      })
      .filter(Boolean)
      .join("\n")

    onChange(formattedValue)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">≡ Live Bullets</span>
          {showAIButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI Generate
            </Button>
          )}
        </div>
      </div>

      {/* User input – accepts anything */}
      <Textarea
        value={localDescription}
        onChange={(e) => setLocalDescription(e.target.value)}
        onBlur={handleBlur}
        className="mt-1"
        rows={4}
        placeholder="Use line breaks for each bullet (e.g. Led a team↵Implemented a system...)"
      />

      {/* Preview with live bullets */}
      {localDescription &&
        localDescription.split("\n").filter(Boolean).length > 0 && (
          <div className="mt-3 space-y-1">
            {localDescription
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-800"
                >
                  <span className="mt-0.5 text-gray-400">•</span>
                  <span>{line}</span>
                </div>
              ))}
          </div>
        )}
    </div>
  )
}
