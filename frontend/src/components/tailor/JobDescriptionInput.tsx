import { Link, Loader2 } from "lucide-react"

import { mockJobDescriptions } from "@/lib/data/mockTailoringHistory"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface JobDescriptionInputProps {
  jobInputMethod: "url" | "paste"
  onJobInputMethodChange: (method: "url" | "paste") => void
  jobUrl: string
  onJobUrlChange: (url: string) => void
  role: string
  onRoleChange: (role: string) => void
  company: string
  onCompanyChange: (company: string) => void
  parsedJobDescription: string
  onParsedJobDescriptionChange: (description: string) => void
  parsing: boolean
  parsingError: boolean | "third-party"
  onFetchAndParse: () => void
}

// Helper function to get mock data based on URL
const getMockDataFromUrl = (url: string) => {
  const urlLower = url.toLowerCase()
  if (urlLower.includes("google")) return mockJobDescriptions.google
  if (urlLower.includes("meta") || urlLower.includes("facebook"))
    return mockJobDescriptions.meta
  if (urlLower.includes("amazon")) return mockJobDescriptions.amazon
  if (urlLower.includes("netflix")) return mockJobDescriptions.netflix
  return null
}

// Update the label for company description to show it's optional
const CompanyDescriptionLabel = () => (
  <div className="flex items-center gap-1">
    <span className="text-sm font-medium text-gray-700">
      Company Description
    </span>
    <span className="text-xs text-gray-500">(Optional)</span>
  </div>
)

export function JobDescriptionInput({
  jobInputMethod,
  onJobInputMethodChange,
  jobUrl,
  onJobUrlChange,
  role,
  onRoleChange,
  company,
  onCompanyChange,
  parsedJobDescription,
  onParsedJobDescriptionChange,
  parsing,
  parsingError,
  onFetchAndParse,
}: JobDescriptionInputProps) {
  return (
    <div className="space-y-6">
      {/* Header with Input Method Toggle */}
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-lg font-medium text-gray-900">Job Details</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={jobInputMethod === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => onJobInputMethodChange("url")}
          >
            URL
          </Button>
          <Button
            variant={jobInputMethod === "paste" ? "default" : "outline"}
            size="sm"
            onClick={() => onJobInputMethodChange("paste")}
          >
            Manual Entry
          </Button>
        </div>
      </div>

      {/* URL Input Section */}
      {jobInputMethod === "url" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="relative">
              <Link className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Try: google.com/jobs, meta.com/careers, amazon.jobs, netflix.com/jobs"
                value={jobUrl}
                onChange={(e) => onJobUrlChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="mt-2">
              <Button
                onClick={onFetchAndParse}
                disabled={!jobUrl || parsing}
                className="mt-2 w-full sm:w-auto"
              >
                {parsing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>Fetch & Parse Job Details</>
                )}
              </Button>
            </div>
          </div>

          {parsing && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <p>URL is being parsed, please wait...</p>
              </div>
            </div>
          )}

          {parsingError === true && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              Failed to parse job details from the URL. Please edit the details
              below manually.
            </div>
          )}

          {parsingError === "third-party" && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              Third-party job boards are not supported. Please use the official
              company career page or enter the details manually.
            </div>
          )}
        </div>
      )}

      {/* Job Details Form */}
      {(jobInputMethod === "paste" ||
        (!parsing &&
          (parsingError || role || company || parsedJobDescription))) && (
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                {jobInputMethod === "url" && role && !parsingError && (
                  <span className="text-xs text-gray-500" aria-live="polite">
                    Parsed from URL • Edit if needed
                  </span>
                )}
              </div>
              <Input
                placeholder={
                  jobInputMethod === "url"
                    ? parsingError
                      ? "Enter role manually..."
                      : "Role will appear here after parsing..."
                    : "e.g. Software Engineer"
                }
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                {jobInputMethod === "url" && company && !parsingError && (
                  <span className="text-xs text-gray-500" aria-live="polite">
                    Parsed from URL • Edit if needed
                  </span>
                )}
              </div>
              <Input
                placeholder={
                  jobInputMethod === "url"
                    ? parsingError
                      ? "Enter company manually..."
                      : "Company will appear here after parsing..."
                    : "e.g. Google"
                }
                value={company}
                onChange={(e) => onCompanyChange(e.target.value)}
              />
            </div>
          </div>

          {/* Job Description Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Job Description
              </label>
              {jobInputMethod === "url" &&
                parsedJobDescription &&
                !parsingError && (
                  <span className="text-xs text-gray-500" aria-live="polite">
                    Parsed from URL • Edit if needed
                  </span>
                )}
            </div>
            <Textarea
              placeholder={
                jobInputMethod === "url"
                  ? parsingError
                    ? "Enter job description manually..."
                    : "Job description will appear here after parsing..."
                  : "Enter job description..."
              }
              value={parsedJobDescription}
              onChange={(e) => onParsedJobDescriptionChange(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
