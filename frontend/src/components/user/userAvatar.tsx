import React from "react"

import type { UserProfile } from "@/types/user"

import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  user: UserProfile | null
  className?: string
  size?: "sm" | "md" | "lg"
}

const UserAvatar = ({ user, className, size = "md" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  const getInitials = () => {
    const first = user?.first_name
    const last = user?.last_name
    if (!first && !last) return "U"
    return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
  }

  return (
    <div className="relative">
      <Avatar
        className={cn(sizeClasses[size], "ring-2 ring-gray-200", className)}
      >
        <AvatarImage
          src={user?.avatar_url || "/avatars/shadcn.jpg"}
          alt={user ? `${user.first_name} ${user.last_name}` : "User avatar"}
        />
        <AvatarFallback className="bg-primary font-medium text-primary-foreground">
          {getInitials()}
        </AvatarFallback>
      </Avatar>

      {/* Status indicator removed since `plan` is no longer in schema */}
    </div>
  )
}

export default UserAvatar
