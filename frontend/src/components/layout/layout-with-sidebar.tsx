"use client"

import { type ReactNode } from "react"

import { type UserProfile } from "@/types/user"

import SidebarClient from "@/components/sidebar/SidebarClient"

interface LayoutWithSidebarProps {
  children: ReactNode
  userProfile: UserProfile
}

export function LayoutWithSidebar({
  children,
  userProfile,
}: LayoutWithSidebarProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <SidebarClient userProfile={userProfile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
