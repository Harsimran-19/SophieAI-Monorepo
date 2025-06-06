"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signInWithEmail } from "@/actions/auth/sign-in-with-email"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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

const signInWithEmailSchema = z.object({
  email: z.string().email('Invalid email format')
})

type SignInWithEmailFormInput = z.infer<typeof signInWithEmailSchema>

export default function SignInWithEmailForm(): JSX.Element {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<SignInWithEmailFormInput>({
    resolver: zodResolver(signInWithEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  // async function onSubmit(formData: SignInWithEmailFormInput) {
  //     startTransition(() => {
  //     try {
  //       const message = await signInWithEmail({
  //         email: formData.email,
  //       })

  //       switch (message) {
  //         case "success":
  //           toast({
  //             title: "Link Sent",
  //             description: "Check your email to complete sign in",
  //           })
  //           break
  //         case "error":
  //           toast({
  //             title: "Sign In Error",
  //             description: "Please try again",
  //             variant: "destructive",
  //           })
  //           break
  //         case "invalid-input":
  //           toast({
  //             title: "Invalid Email",
  //             description: "Please enter a valid email address",
  //             variant: "destructive",
  //           })
  //           break
  //       }
  //     } catch (error) {
  //       console.error(error)
  //       toast({
  //         title: "Something went wrong",
  //         description: "Please try again",
  //         variant: "destructive",
  //       })
  //     }
  //   })
  // }

  return (
    <Form {...form}>
      <form
        className="grid w-full gap-4"

      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Please enter your email"
                  {...field}
                />
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
              <span>Sending Login Link...</span>
            </>
          ) : (
            <span>Send Login Link</span>
          )}
          <span className="sr-only">Sign In</span>
        </Button>
      </form>
    </Form>
  )
}