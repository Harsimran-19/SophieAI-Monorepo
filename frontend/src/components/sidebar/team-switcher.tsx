"use client"

import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RocketIcon } from "lucide-react"

export function TeamSwitcher() {
  // const [activeTeam, setActiveTeam] = React.useState(teams[0])

  return (
    <div className="flex items-center justify-center">
    <SidebarMenu >
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <RocketIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {'SophieAI'}
                </span>
                <span className="truncate text-xs">{'Free Plan'}</span>
              </div>
              {/* <ChevronsUpDown className="ml-auto" /> */}
            </SidebarMenuButton>
            {/* <ThemeToggle/> */}
          </DropdownMenuTrigger>
          {/* <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setActiveTeam(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <team.logo className="size-4 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent> */}
        </DropdownMenu>
      </SidebarMenuItem>

    </SidebarMenu>
    
    </div>
  )
}
