"use client"

import { Layers, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FloatingPanelControlsProps {
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  onLeftPanelToggle: () => void
  onRightPanelToggle: () => void
}

export function FloatingPanelControls({
  leftPanelOpen,
  rightPanelOpen,
  onLeftPanelToggle,
  onRightPanelToggle,
}: FloatingPanelControlsProps) {
  return (
    <>
      {/* Left Panel Control - Bookmark Style */}
      <div className="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 transform">
        <Button
          onClick={onLeftPanelToggle}
          className={`
            relative h-16 w-8 rounded-l-none rounded-r-lg shadow-lg transition-all duration-200
            ${
              leftPanelOpen
                ? "translate-x-0 bg-blue-600 text-white hover:bg-blue-700"
                : "translate-x-0 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }
          `}
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <Layers className="h-4 w-4" />
            <span className="rotate-180 transform text-xs font-medium">
              Form
            </span>
          </div>

          {/* Bookmark Tab */}
          <div
            className={`
              absolute -right-2 top-1/2 h-0 w-0
              -translate-y-1/2 transform border-b-4 border-l-8 border-t-4
              ${
                leftPanelOpen
                  ? "border-b-transparent border-l-blue-600 border-t-transparent"
                  : "border-b-transparent border-l-white border-t-transparent"
              }
            `}
          />
        </Button>
      </div>

      {/* Right Panel Control - Bookmark Style */}
      <div className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 transform">
        <Button
          onClick={onRightPanelToggle}
          className={`
            relative h-16 w-8 rounded-l-lg rounded-r-none shadow-lg transition-all duration-200
            ${
              rightPanelOpen
                ? "translate-x-0 bg-orange-600 text-white hover:bg-orange-700"
                : "translate-x-0 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }
          `}
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="rotate-180 transform text-xs font-medium">AI</span>
          </div>

          {/* Bookmark Tab */}
          <div
            className={`
              absolute -left-2 top-1/2 h-0 w-0
              -translate-y-1/2 transform border-b-4 border-r-8 border-t-4
              ${
                rightPanelOpen
                  ? "border-b-transparent border-r-orange-600 border-t-transparent"
                  : "border-b-transparent border-r-white border-t-transparent"
              }
            `}
          />
        </Button>
      </div>
    </>
  )
}
