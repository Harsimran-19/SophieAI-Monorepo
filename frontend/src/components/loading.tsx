import { Icons } from "@/components/icons"

export function LoadingPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Icons.spinner className="size-8 animate-spin" />
    </div>
  )
}

export function LoadingSpinner() {
  return <Icons.spinner className="size-4 animate-spin" />
}
