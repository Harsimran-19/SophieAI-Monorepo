"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react"

import type { Resume } from "@/types/resume"

import { useUser } from "@/hooks/use-user"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumePreview } from "@/components/resume-preview"

// // Mock data for resume documents
// const mockResumes = [
//   {
//     id: "1",
//     name: "swe_for_startup",
//     lastModified: "2023-05-15",
//     category: "tech",
//     template: "modern",
//     data: {
//       personalInfo: {
//         fullName: "Alex Johnson",
//         email: "alex.johnson@example.com",
//         phone: "(555) 123-4567",
//         location: "San Francisco, CA",
//         summary:
//           "Full-stack software engineer with 3 years of experience in building scalable web applications. Passionate about clean code and user-centric design.",
//       },
//       experiences: [
//         {
//           company: "TechStart Inc.",
//           position: "Software Engineer",
//           startDate: "Jan 2021",
//           endDate: "Present",
//           description:
//             "Developed and maintained RESTful APIs using Node.js and Express. Implemented responsive front-end interfaces with React and TypeScript.",
//         },
//         {
//           company: "CodeLabs",
//           position: "Junior Developer",
//           startDate: "Jun 2019",
//           endDate: "Dec 2020",
//           description:
//             "Assisted in the development of web applications using JavaScript and React. Collaborated with the design team to implement UI components.",
//         },
//       ],
//       education: [
//         {
//           institution: "University of California, Berkeley",
//           degree: "B.S.",
//           fieldOfStudy: "Computer Science",
//           graduationDate: "2019",
//         },
//       ],
//       skills: [
//         { name: "JavaScript", level: "Expert" },
//         { name: "React", level: "Advanced" },
//         { name: "Node.js", level: "Advanced" },
//         { name: "TypeScript", level: "Intermediate" },
//         { name: "MongoDB", level: "Intermediate" },
//       ],
//     },
//   },
//   {
//     id: "2",
//     name: "frontend_for_faang",
//     lastModified: "2023-06-02",
//     category: "tech",
//     template: "classic",
//     data: {
//       personalInfo: {
//         fullName: "Alex Johnson",
//         email: "alex.johnson@example.com",
//         phone: "(555) 123-4567",
//         location: "San Francisco, CA",
//         summary:
//           "Frontend engineer with expertise in building performant and accessible web applications. Experienced with modern JavaScript frameworks and design systems.",
//       },
//       experiences: [
//         {
//           company: "TechStart Inc.",
//           position: "Frontend Engineer",
//           startDate: "Jan 2021",
//           endDate: "Present",
//           description:
//             "Led the frontend development of the company's flagship product. Implemented performance optimizations resulting in 40% faster load times.",
//         },
//         {
//           company: "CodeLabs",
//           position: "UI Developer",
//           startDate: "Jun 2019",
//           endDate: "Dec 2020",
//           description:
//             "Developed responsive UI components using React and styled-components. Collaborated with UX designers to implement design systems.",
//         },
//       ],
//       education: [
//         {
//           institution: "University of California, Berkeley",
//           degree: "B.S.",
//           fieldOfStudy: "Computer Science",
//           graduationDate: "2019",
//         },
//       ],
//       skills: [
//         { name: "JavaScript", level: "Expert" },
//         { name: "React", level: "Expert" },
//         { name: "CSS/SCSS", level: "Advanced" },
//         { name: "TypeScript", level: "Advanced" },
//         { name: "Web Performance", level: "Advanced" },
//         { name: "Accessibility", level: "Intermediate" },
//       ],
//     },
//   },
//   {
//     id: "3",
//     name: "product_manager_tech",
//     lastModified: "2023-04-28",
//     category: "product",
//     template: "executive",
//     data: {
//       personalInfo: {
//         fullName: "Alex Johnson",
//         email: "alex.johnson@example.com",
//         phone: "(555) 123-4567",
//         location: "San Francisco, CA",
//         summary:
//           "Product manager with a technical background and 3 years of experience in software development. Skilled in translating business requirements into technical specifications.",
//       },
//       experiences: [
//         {
//           company: "TechStart Inc.",
//           position: "Associate Product Manager",
//           startDate: "Jan 2022",
//           endDate: "Present",
//           description:
//             "Led the development of new product features from conception to launch. Collaborated with engineering, design, and marketing teams to ensure successful product delivery.",
//         },
//         {
//           company: "TechStart Inc.",
//           position: "Software Engineer",
//           startDate: "Jan 2021",
//           endDate: "Dec 2021",
//           description:
//             "Developed and maintained web applications. Transitioned to product management to leverage technical expertise in product development.",
//         },
//       ],
//       education: [
//         {
//           institution: "University of California, Berkeley",
//           degree: "B.S.",
//           fieldOfStudy: "Computer Science",
//           graduationDate: "2019",
//         },
//       ],
//       skills: [
//         { name: "Product Strategy", level: "Intermediate" },
//         { name: "User Research", level: "Intermediate" },
//         { name: "Agile Methodologies", level: "Advanced" },
//         { name: "Technical Communication", level: "Advanced" },
//         { name: "Data Analysis", level: "Intermediate" },
//       ],
//     },
//   },
//   {
//     id: "4",
//     name: "data_scientist_finance",
//     lastModified: "2023-05-20",
//     category: "data",
//     template: "technical",
//     data: {
//       personalInfo: {
//         fullName: "Alex Johnson",
//         email: "alex.johnson@example.com",
//         phone: "(555) 123-4567",
//         location: "San Francisco, CA",
//         summary:
//           "Data scientist with a strong background in statistical analysis and machine learning. Experienced in applying data science techniques to financial problems.",
//       },
//       experiences: [
//         {
//           company: "FinTech Solutions",
//           position: "Junior Data Scientist",
//           startDate: "Mar 2021",
//           endDate: "Present",
//           description:
//             "Developed predictive models for credit risk assessment. Implemented data pipelines for automated data processing and analysis.",
//         },
//         {
//           company: "Data Analytics Inc.",
//           position: "Data Analyst Intern",
//           startDate: "Jun 2020",
//           endDate: "Feb 2021",
//           description:
//             "Assisted in data cleaning, analysis, and visualization. Created dashboards to track key business metrics.",
//         },
//       ],
//       education: [
//         {
//           institution: "University of California, Berkeley",
//           degree: "B.S.",
//           fieldOfStudy: "Statistics",
//           graduationDate: "2020",
//         },
//       ],
//       skills: [
//         { name: "Python", level: "Advanced" },
//         { name: "R", level: "Intermediate" },
//         { name: "Machine Learning", level: "Intermediate" },
//         { name: "SQL", level: "Advanced" },
//         { name: "Data Visualization", level: "Advanced" },
//         { name: "Financial Analysis", level: "Intermediate" },
//       ],
//     },
//   },
// ]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResume, setSelectedResume] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [resumes, setResumes] = useState<Resume[]>([])
  const { user } = useUser()

  // // Filter resumes based on search query and active tab
  // const filteredResumes = mockResumes.filter((resume) => {
  //   const matchesSearch = resume.name
  //     .toLowerCase()
  //     .includes(searchQuery.toLowerCase())
  //   const matchesTab = activeTab === "all" || resume.category === activeTab
  //   return matchesSearch && matchesTab
  // })

  useEffect(() => {
    if (user) {
      const fetchResumes = async () => {
        const response = await fetch(`/api/resumes`)
        const data = await response.json()
        setResumes(data)
      }
      fetchResumes()
    }
  }, [user])

  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch = resume.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all"
    return matchesSearch && matchesTab
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 size-4" /> Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Document Center</h1>
        <p className="text-muted-foreground">
          Manage all your resume versions in one place
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resumes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-xs"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="tech">Tech</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="size-9"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="size-9"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span className="sr-only">List view</span>
            </Button>
          </div>
        </div>
      </div>

      {filteredResumes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">No resumes found</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery
                ? `No resumes matching "${searchQuery}"`
                : "You haven't created any resumes yet or none match the selected filter."}
            </p>
            <Button asChild>
              <Link href="/create">Create New Resume</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResumes.map((resume) => (
            <Card key={resume.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{resume.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setSelectedResume(resume)}
                      >
                        <Eye className="mr-2 size-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 size-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  Last modified: {resume.updated_at}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="size-12 text-muted-foreground opacity-50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResumes.map((resume) => (
            <Card key={resume.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                      <FileText className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium">{resume.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last modified: {resume.updated_at}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedResume(resume)}
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="ghost" size="icon">
                      <Edit className="size-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="size-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="size-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resume Preview Dialog */}
      {selectedResume && (
        <Dialog
          open={!!selectedResume}
          onOpenChange={(open) => !open && setSelectedResume(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedResume.title}</DialogTitle>
              <DialogDescription>
                Last modified: {selectedResume.updated_at}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <ResumePreview data={selectedResume.data} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedResume(null)}>
                Close
              </Button>
              <Button>
                <Edit className="mr-2 size-4" />
                Edit Resume
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 size-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
