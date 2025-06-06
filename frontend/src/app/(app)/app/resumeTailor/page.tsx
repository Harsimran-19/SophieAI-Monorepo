"use client"

import { useEffect, useState } from "react"
import { fetchAllApplicationsByCurrentUser } from "@/actions/tailored_applications/fetchAllApplicationsByCurrentUser"
import { Loader2 } from "lucide-react"

import type { Application } from "@/types/application"

import { TailorActionBar } from "@/components/tailor/TailorActionBar"
import { TailorHeader } from "@/components/tailor/TailorHeader"
import { TailorHistoryTable } from "@/components/tailor/TailorHistoryTable"
import { TailorNewRequestModal } from "@/components/tailor/TailorNewRequestModal"
import { TailorNotificationDialog } from "@/components/tailor/TailorNotificationDialog"

export default function TailorResumePage() {
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [searchHistory, setSearchHistory] = useState("")
  const [tailoringHistory, setTailoringHistory] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await fetchAllApplicationsByCurrentUser()
      setTailoringHistory(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredHistory = tailoringHistory.filter(
    (item) =>
      item.job.job_title.toLowerCase().includes(searchHistory.toLowerCase()) ||
      item.company.name.toLowerCase().includes(searchHistory.toLowerCase())
  )

  const handleModalSubmit = () => {
    console.log("🎯 Modal submission callback triggered")
    setShowNewRequestModal(false)
    setShowNotification(true)
    console.log("✅ Modal closed and notification shown")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex flex-1 flex-col">
        <TailorHeader />

        <div className="flex-1 space-y-6 overflow-auto p-6">
          <TailorActionBar
            searchQuery={searchHistory}
            setSearchQuery={setSearchHistory}
            onNewRequestClick={() => {
              console.log("🔘 New request button clicked")
              setShowNewRequestModal(true)
            }}
          />
          <TailorHistoryTable tailoringHistory={filteredHistory} />
        </div>
      </div>

      <TailorNewRequestModal
        open={showNewRequestModal}
        onOpenChange={(open) => {
          console.log("🔄 Modal open state changing to:", open)
          setShowNewRequestModal(open)
        }}
        onSubmit={handleModalSubmit}
      />

      <TailorNotificationDialog
        open={showNotification}
        onOpenChange={(open) => {
          console.log("🔔 Notification dialog state changing to:", open)
          setShowNotification(open)
        }}
      />
    </div>
  )
}
