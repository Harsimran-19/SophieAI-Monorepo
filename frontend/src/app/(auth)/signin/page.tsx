"use client"

import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInWithPasswordForm } from "@/components/forms/signin-with-password-form"
import { Icons } from "@/components/icons"

export default function SignInPage() {
  return (
    <div className="flex h-auto min-h-screen w-full items-center justify-center">
      <Card className="w-full max-w-[368px] sm:rounded-lg sm:border sm:shadow">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <Link href="/">
              <Icons.close className="size-4" />
            </Link>
          </div>
          <CardDescription>
            Sign in using your InternUp VIP email
          </CardDescription>
        </CardHeader>

        <CardContent className="w-full px-6 sm:px-10">
          <SignInWithPasswordForm />
        </CardContent>

        <CardFooter className="grid w-full gap-2 px-6 text-sm text-muted-foreground sm:px-10">
          <p className="sr-only">
            Only InternUp VIP users are allowed access to sign in
          </p>
          <p>
            Don&apos;t have an account?{" "}
            <Link
              aria-label="Sign up"
              href="/signup"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
          <p>
            Are you a VIP but not able to access? Contact us at{" "}
            <a href="mailto:contact@internup.org" className="underline">
              contact@internup.org
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
