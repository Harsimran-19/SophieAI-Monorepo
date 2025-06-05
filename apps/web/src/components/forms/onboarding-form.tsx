"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { updateProfile } from "@/actions/users/updateProfile"
import { useAuth } from "@/context/AuthProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { onboardingSchema, type OnboardingFormInput } from "@/validations/user"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"

interface OnboardingFormProps {
  className?: string
}

/**
 * OnboardingForm component for collecting user's first and last name
 * Includes form validation, error handling, and loading states
 */
export function OnboardingForm({
  className,
}: OnboardingFormProps): JSX.Element {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = React.useTransition()
  const { user } = useAuth()

  const form = useForm<OnboardingFormInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })

  const handleSubmit = React.useCallback(
    async (formData: OnboardingFormInput) => {
      if (!user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        })
        return
      }

      startTransition(async () => {
        try {
          const result = await updateProfile(formData, user.id)

          if (!result.success) {
            toast({
              title: "Error",
              description: result.error || "Failed to update profile",
              variant: "destructive",
            })
            return
          }

          toast({
            title: "Success",
            description: "Your profile has been successfully updated",
          })

          // Give time for the toast to be read
          await new Promise((resolve) => setTimeout(resolve, 1000))
          router.push("/app")
        } catch (error) {
          console.error("Profile update error:", error)
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          })
        }
      })
    },
    [user?.id, router, toast]
  )

  return (
    <Form {...form}>
      <form
        className="grid gap-4"
        onSubmit={(...args) => void form.handleSubmit(handleSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="firstName">First Name</FormLabel>
              <FormControl>
                <Input
                  id="firstName"
                  placeholder="John"
                  autoComplete="given-name"
                  disabled={isPending}
                  aria-describedby="firstName-description"
                  {...field}
                />
              </FormControl>
              <FormMessage className="pt-2 sm:text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="lastName">Last Name</FormLabel>
              <FormControl>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  autoComplete="family-name"
                  disabled={isPending}
                  aria-describedby="lastName-description"
                  {...field}
                />
              </FormControl>
              <FormMessage className="pt-2 sm:text-sm" />
            </FormItem>
          )}
        />

        <Button
          className="mt-4"
          disabled={isPending || !form.formState.isDirty}
          aria-disabled={isPending}
          type="submit"
        >
          {isPending ? (
            <>
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              <span>Saving...</span>
            </>
          ) : (
            <span>Continue</span>
          )}
          <span className="sr-only">
            {isPending ? "Saving profile information" : "Continue to dashboard"}
          </span>
        </Button>
      </form>
    </Form>
  )
}
