import Link from "next/link"

import { siteConfig } from "@/config/site"
import { createClient } from "@/lib/supabase/server"
import { type Session } from '@supabase/supabase-js'
// import auth from "@/lib/auth"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/auth/signout-button"
import { Icons } from "@/components/icons"
import { Navigation } from "@/components/nav/navigation"
import { NavigationMobile } from "@/components/nav/navigation-mobile"
import { ThemeToggle } from "@/components/theme-toggle"

interface UserMetadata {
  avatar_url?: string
  full_name?: string
}

export async function Header(): Promise<JSX.Element> {
  // const session = await auth()
  const supabase = createClient()
  const { data: { session } }: { data: { session: Session | null } } = await supabase.auth.getSession()

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full bg-transparent">
      <div className="container flex items-center justify-between p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-2xl font-bold tracking-wide transition-all duration-300 ease-in-out"
        >
          {/* <Icons.rocket className="size-6 md:hidden lg:flex" /> */}
          <span className="hidden md:flex">{siteConfig.name}</span>
        </Link>
        <Navigation navItems={siteConfig.navItems} />
        <div className="flex items-center justify-center">
          <ThemeToggle />
          <NavigationMobile navItems={siteConfig.navItems} />

          <nav className="space-x-1">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "transition-all duration-300 ease-in-out hover:opacity-70"
                  )}
                >
                  <Avatar className="size-9">
                  <AvatarFallback className="size-9 cursor-pointer p-1.5 text-xs capitalize">
                        <Icons.user className="size-5 rounded-full" />
                      </AvatarFallback>
                    {/* {(session.user.user_metadata as UserMetadata)?.avatar_url ? (
                      <AvatarImage
                        src={(session.user.user_metadata as UserMetadata).avatar_url}
                        alt={(session.user.user_metadata as UserMetadata).full_name ?? "user's profile picture"}
                        className="size-7 rounded-full"
                      />
                    ) : (
                      <AvatarFallback className="size-9 cursor-pointer p-1.5 text-xs capitalize">
                        <Icons.user className="size-5 rounded-full" />
                      </AvatarFallback>
                    )} */}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {(session.user.user_metadata as UserMetadata).full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild disabled>
                      <Link href="/dashboard/account">
                        <Icons.avatar
                          className="mr-2 size-4"
                          aria-hidden="true"
                        />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild disabled>
                      <Link href="/dashboard/settings">
                        <Icons.settings
                          className="mr-2 size-4"
                          aria-hidden="true"
                        />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <SignOutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div>
              <Link
                aria-label="Sign In"
                href="/signin"
                className={cn(buttonVariants({ size: "sm" }), "ml-2")}
              >
                Sign In
                <span className="sr-only">Sign In</span>
              </Link>
              <Link
                aria-label="Join Now"
                href="/signup"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "ml-2")}
              >
                Join Now
                <span className="sr-only">Join Now</span>
              </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
