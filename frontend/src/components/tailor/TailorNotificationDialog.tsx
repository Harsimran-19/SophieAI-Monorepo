import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TailorNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TailorNotificationDialog({
  open,
  onOpenChange,
}: TailorNotificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Submitted Successfully!</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <Sparkles className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Your tailored resume is being generated. This process may take
                up to 1 minute.
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <p className="mb-1 text-sm font-medium text-blue-800">
              What happens next?
            </p>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• We&apos;ll analyze the job requirements</li>
              <li>• Customize your resume content</li>
              <li>• Notify you when it&apos;s ready</li>
            </ul>
          </div>

          <p className="text-center text-sm text-gray-600">
            You can continue using other parts of the website while we work on
            your resume.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
