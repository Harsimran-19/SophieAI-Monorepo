"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DEFAULT_SIGNOUT_REDIRECT } from "@/config/defaults"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function SignOutButton(): JSX.Element {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(DEFAULT_SIGNOUT_REDIRECT)
    router.refresh()
  }

  return (
    <Button
      aria-label="Sign Out"
      variant="ghost"
      className="w-full justify-start text-sm"
      onClick={() => {
        void handleSignOut()
      }}
    >
      <Icons.logout className="mr-2 size-4" aria-hidden="true" />
      Sign out
    </Button>
  )
}