"use client"

import { useState, useRef } from "react"
import { uploadDocument } from "@/actions/documents"
import { UserDocument } from "@/types/user-profile"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, File as FileIcon } from "lucide-react"

// Form schema validation
const uploadFormSchema = z.object({
  documentType: z.enum(["resume", "cover_letter", "other"], {
    required_error: "Please select a document type",
  }),
  displayName: z.string().optional(),
  file: z.instanceof(File, {
    message: "Please upload a file",
  }),
})

type UploadFormValues = z.infer<typeof uploadFormSchema>

interface DocumentUploadProps {
  onSuccess: (document: UserDocument) => void
}

export default function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize the form
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      documentType: "resume",
      displayName: "",
    },
  })

  // Handle form submission
  const onSubmit = async (values: UploadFormValues) => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocument(
        values.file,
        values.documentType as any,
        values.displayName || undefined
      )

      if (result.success && result.data) {
        onSuccess(result.data)

        // Reset form
        form.reset({
          documentType: "resume",
          displayName: "",
        })

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setError(result.error || "Failed to upload document")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("file", file, { shouldValidate: true })
    }
  }

  // Get the selected file name
  const selectedFileName = form.watch("file")?.name

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Document Type Select */}
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="resume">Resume</SelectItem>
                      <SelectItem value="cover_letter">Cover Letter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem>
                  <FormLabel>Document File</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt,.rtf"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full w-full"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      <div className={`flex items-center justify-center h-10 px-4 py-2 rounded-md border ${selectedFileName ? 'border-green-500 bg-green-50' : 'border-gray-300'} text-sm`}>
                        <FileIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">
                          {selectedFileName || "Choose a file"}
                        </span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name Input */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Document Name (Optional)</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="text"
                      placeholder={selectedFileName ? selectedFileName.split('.')[0] : "Enter a name for your document"}
                      className="w-full h-10 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isUploading || !form.formState.isValid}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
