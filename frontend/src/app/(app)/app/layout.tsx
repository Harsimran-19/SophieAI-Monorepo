import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

import { SidebarProvider } from "@/components/ui/sidebar"
import { LayoutWithSidebar } from "@/components/layout/layout-with-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/signin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.first_name || !profile?.last_name) {
    redirect("/onboarding")
  }

  return (
    <SidebarProvider>
      <LayoutWithSidebar userProfile={profile}>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}
