"use client"

import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth: number
  minWidth: number
  maxWidth: number
  position: "left" | "right"
  onWidthChange?: (width: number) => void
  className?: string
}

export function ResizablePanel({
  children,
  defaultWidth,
  minWidth,
  maxWidth,
  position,
  onWidthChange,
  className,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
      e.preventDefault()
    },
    [width]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      const deltaX =
        position === "left"
          ? e.clientX - startXRef.current
          : startXRef.current - e.clientX
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + deltaX)
      )

      setWidth(newWidth)
      onWidthChange?.(newWidth)
    },
    [isResizing, position, minWidth, maxWidth, onWidthChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className={cn(
        `relative flex h-full min-h-0 flex-col bg-white ${
          position === "left" ? "border-r" : "border-l"
        }`,
        className
      )}
      style={{
        width: `${width}px`,
        minWidth: `${minWidth}px`,
        maxWidth: `${maxWidth}px`,
      }}
    >
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Resize Handle */}
      <div
        className={`group absolute inset-y-0 w-[2px] cursor-col-resize bg-gray-100 transition-colors hover:bg-blue-400/50 ${
          position === "left" ? "right-0" : "left-0"
        } ${isResizing ? "bg-blue-500/50" : ""}`}
        onMouseDown={handleMouseDown}
      >
        <div
          className={`invisible absolute top-1/2 flex h-16 w-1 -translate-y-1/2 items-center justify-center rounded-sm bg-blue-400/50 opacity-0 transition-all group-hover:visible group-hover:opacity-100 ${
            position === "left" ? "right-0" : "left-0"
          } ${isResizing ? "!visible !opacity-100" : ""}`}
        >
          <GripVertical className="size-3 text-white" />
        </div>
      </div>
    </div>
  )
}
