"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function OAuthButtons(): JSX.Element {
  const { toast } = useToast()
  const supabase = createClient()

  async function handleOAuthSignIn(provider: "google" | "github"): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,  // Simplified redirect
          skipBrowserRedirect: false
        }
      })

      if (error) throw error

    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  return (
    <div className="">
      <Button
        aria-label="Sign in with Google"
        variant="outline"
        onClick={() => void handleOAuthSignIn("google")}
        className="w-full"
      >
        <Icons.google className="mr-2 size-4" />
        Google
      </Button>

      {/* <Button
        aria-label="Sign in with gitHub"
        variant="outline"
        onClick={() => void handleOAuthSignIn("github")}
        className="w-full sm:w-auto"
      >
        <Icons.gitHub className="mr-2 size-4" />
        GitHub
      </Button> */}
    </div>
  )
}