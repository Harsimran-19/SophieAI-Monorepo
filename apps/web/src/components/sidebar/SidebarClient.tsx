"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "@/actions/auth/sign-out"
import {
  Bot,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  File,
  FileEdit,
  FileSearch,
  LogOut,
  Settings,
  SquareTerminal,
} from "lucide-react"

import { type UserProfile } from "@/types/user"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"

import UserAvatar from "../user/userAvatar"

interface SidebarClientProps {
  userProfile: UserProfile | null
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
}

const navCategories = [
  {
    title: "",
    items: [
      { title: "Dashboard", url: "/app", icon: SquareTerminal },
      {
        title: "Material Generator",
        url: "/app/materialGenerator",
        icon: Briefcase,
      },
      { title: "Document Center", url: "/app/documentCenter", icon: File },
      { title: "Resume Bot", url: "/app/resumeBot", icon: Bot },
      { title: "Create Resume", url: "/app/resumeBuilder", icon: FileEdit },
      {
        title: "Tailor Resume to Job",
        url: "/app/resumeTailor",
        icon: FileSearch,
      },
    ],
  },
  {
    title: "Settings",
    items: [{ title: "Settings", url: "/app/settings", icon: Settings }],
  },
]

const SidebarClient = ({
  userProfile,
  className,
  onCollapsedChange,
}: SidebarClientProps) => {
  const [collapsed, setCollapsed] = useState(() => {
    // Only run on client-side
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved === "true"
    }
    return false
  })
  const pathname = usePathname()
  const router = useRouter()

  const toggleSidebar = () => {
    const newCollapsed = !collapsed
    localStorage.setItem("sidebar-collapsed", String(newCollapsed))
    setCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const isActive = (url: string) => {
    return pathname === url || (url !== "/app" && pathname.startsWith(url))
  }

  const fullName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : "Test User"

  const handleLogout = async () => {
    try {
      const result = await signOut()
      if (result.success) {
        router.push("/signin")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-200 bg-white transition-[width] duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        {!collapsed && (
          <div className="text-lg font-semibold text-primary">SophieAI</div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="rounded-full p-2 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navCategories.map((category, index) => (
          <div key={index} className="mb-4">
            {category.title && !collapsed && (
              <p className="mb-2 px-4 text-xs font-medium uppercase text-gray-400">
                {category.title}
              </p>
            )}
            <ul className="space-y-1 px-2">
              {category.items.map((item) => {
                const active = isActive(item.url)
                return (
                  <li key={item.title}>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center rounded-lg px-4 py-2 transition-colors duration-200",
                        collapsed ? "justify-center" : "justify-start",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon
                        size={20}
                        className={cn("shrink-0", active && "text-primary")}
                      />
                      {!collapsed && (
                        <span
                          className={cn(
                            "ml-3 text-sm",
                            active && "font-medium"
                          )}
                        >
                          {item.title}
                        </span>
                      )}
                      {active && !collapsed && (
                        <div className="ml-auto h-6 w-1 rounded-full bg-primary" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User profile section */}
      <div
        className={cn(
          "mt-auto flex items-center border-t border-gray-200 p-4",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <UserAvatar user={userProfile} size={collapsed ? "md" : "sm"} />
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="truncate text-sm font-medium text-gray-900">
              {fullName}
            </p>
            <div className="flex items-center"></div>
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="border-t border-gray-200 p-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center border-gray-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
            collapsed ? "justify-center px-2" : "justify-start"
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span className="ml-2">Log Out</span>}
        </Button>
      </div>
    </aside>
  )
}

export default SidebarClient
