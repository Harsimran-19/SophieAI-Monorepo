"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  emailVerificationSchema,
  type EmailVerificationFormInput,
} from "@/validations/email"

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

export function EmailVerificationForm(): JSX.Element {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<EmailVerificationFormInput>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      email: "",
    },
  })

  function onSubmit(formData: EmailVerificationFormInput): void {

  }

  return (
    <Form {...form}>
      <form
        className="grid gap-4 "
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="johnsmith@gmail.com" {...field} />
              </FormControl>
              <FormMessage className="pt-2 sm:text-sm" />
            </FormItem>
          )}
        />

        <Button disabled={isPending}>
          {isPending ? (
            <>
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              <span>Pending...</span>
            </>
          ) : (
            <span>Get verification link</span>
          )}
          <span className="sr-only">Resend email verification link</span>
        </Button>
      </form>
    </Form>
  )
}
