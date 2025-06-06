import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
// import  auth  from "@/lib/auth"

import { env } from "@/env.mjs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { type Session } from '@supabase/supabase-js'
import SignInWithEmailForm from "@/components/forms/signin-with-email-form"
import { Icons } from "@/components/icons"


export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Sign In",
  description: "Sign in to your account",
}

export default async function SignInPage() {
  // const session = await auth()
  // if (session) redirect(DEFAULT_SIGNIN_REDIRECT)
  const supabase = createClient()
  const { data: { session } }: { data: { session: Session | null } } = await supabase.auth.getSession()
  if (session) redirect('/dashboard')
  return (
    <div className="flex h-auto min-h-screen w-full items-center justify-center">
      <Card className="max-sm:flex  max-sm:w-full max-sm:flex-col max-sm:items-center max-sm:justify-center max-sm:rounded-none max-sm:border-none sm:min-w-[370px] sm:max-w-[368px]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <Link href="/">
              <Icons.close className="size-4" />
            </Link>
          </div>
          <CardDescription>
            Sign In using your InternUp VIP email
          </CardDescription>
        </CardHeader>
        <CardContent className="max-sm:w-full max-sm:max-w-[340px] max-sm:px-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
          </div>
          <SignInWithEmailForm />
        </CardContent>

        <CardFooter className="grid w-full text-sm text-muted-foreground max-sm:max-w-[340px] max-sm:px-10">
            <div><span className="sr-only">Only InternUp VIP users are allowed access to signIn</span></div>
          {/* <div>
            <span>Don&apos;t have an account? </span>
            <Link
              aria-label="Sign up"
              href="/signup"
              className="font-bold tracking-wide text-primary underline-offset-4 transition-colors hover:underline"
            >
              Sign up
              <span className="sr-only">Sign up</span>
            </Link> */}
          {/* </div> */}
          <div>
            <span>Are you a VIP but not able to access? </span>
            <span>contact us at contact@internup.org</span>
            {/* <Link
              aria-label="Reset password"
              href="/signin/password-reset"
              className="text-sm font-normal text-primary underline-offset-4 transition-colors hover:underline"
            >
              Contact Us as contact@internup.org
              <span className="sr-only">Reset Password</span>
            </Link> */}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
