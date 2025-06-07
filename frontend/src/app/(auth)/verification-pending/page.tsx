import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

const VerificationPending = () => {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-50 p-3">
                <Mail className="size-6 text-blue-500" aria-hidden="true" />
              {/* <Icons. className="size-6 text-blue-500" aria-hidden="true" /> */}
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
          <CardDescription className="mt-2">
            We&apos;ve sent you a verification link to your email address. Please click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* <div className="text-center text-sm text-muted-foreground">
            <p>Didn't receive the email? Check your spam folder or</p>
            <Button variant="link" className="p-0 h-auto font-normal">
              click here to resend
            </Button>
          </div> */}
          <Link href="/signin" className="w-full">
            <Button variant="outline" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerificationPending