"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import {
  deleteDocument,
  getUserDocuments,
  getDocumentUrl,
  setPrimaryResume
} from "@/actions/documents"
import type { UserDocument } from "@/types/user-profile"
import DocumentUploadModal from "./documentUploadModal"
import {
  Card,
  CardContent,

} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Upload
} from "lucide-react"

export default function DocumentCenterClient() {
  const { user, loading } = useUser()
  const [documents, setDocuments] = useState<UserDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Fetch documents when user is loaded
  useEffect(() => {
    async function fetchDocuments() {
      if (!user) return

      setIsLoading(true)
      const { success, data, error } = await getUserDocuments()

      if (success && data) {
        setDocuments(data)
      } else if (error) {
        setMessage({ type: 'error', text: `Failed to load documents: ${error}` })
      }

      setIsLoading(false)
    }

    if (user) {
      fetchDocuments()
    }
  }, [user])

  // Function to handle document upload success
  const handleUploadSuccess = (newDocument: UserDocument) => {
    setDocuments(prev => [newDocument, ...prev])
    setMessage({ type: 'success', text: 'Document uploaded successfully!' })

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  // Function to handle setting a document as primary resume
  const handleSetPrimary = async (documentId: string) => {
    const result = await setPrimaryResume(documentId)

    if (result.success) {
      // Update local state to reflect the change
      setMessage({ type: 'success', text: 'Primary resume set successfully!' })

      // Refresh document list to get updated primary status
      const { success, data } = await getUserDocuments()
      if (success && data) {
        setDocuments(data)
      }
    } else {
      setMessage({ type: 'error', text: `Failed to set primary resume: ${result.error}` })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  // Function to handle document deletion
  const handleDelete = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      const result = await deleteDocument(documentId)

      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        setMessage({ type: 'success', text: 'Document deleted successfully!' })
      } else {
        setMessage({ type: 'error', text: `Failed to delete document: ${result.error}` })
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    }
  }

  // Function to view/download document
  const handleViewDocument = async (filePath: string) => {
    const { success, url, error } = await getDocumentUrl(filePath)

    if (success && url) {
      window.open(url, '_blank')
    } else {
      setMessage({ type: 'error', text: `Failed to access document: ${error}` })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-b-2 border-green-500"></div>
          <p className="text-xl text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please sign in to access your documents</p>
        </div>
      </div>
    )
  }

  // Sort documents by created date (newest first)
  const sortedDocuments = [...documents].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Document Center</h1>
      <p className="text-gray-600 mb-8">
        Upload your resume, cover letter, or any other job application materials, and let our AI turn them into polished, standout documents. From refining strengths, we ensure you shine in every hiring process.
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="inline-block mr-2 h-5 w-5" />
          ) : (
            <AlertCircle className="inline-block mr-2 h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center mb-8 gap-4">
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2"
          variant="default"
        >
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Document List */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No documents yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">
                Upload your resume, cover letter, or other documents to get started.
              </p>
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium">File Name</TableHead>
                  <TableHead className="font-medium">Document Type</TableHead>
                  <TableHead className="font-medium">Upload Date</TableHead>
                  <TableHead className="font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDocuments.map((doc) => {
                  const isPrimary = user.primary_resume_id === doc.id
                  const uploadDate = new Date(doc.created_at).toLocaleDateString()

                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {doc.display_name || doc.filename.split('.')[0]}
                            </div>
                            <div className="text-xs text-gray-500">{doc.filename}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {doc.document_type === 'resume' && (
                          isPrimary ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Primary Resume</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Resume</Badge>
                          )
                        )}
                        {doc.document_type !== 'resume' && (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {doc.document_type.charAt(0).toUpperCase() + doc.document_type.slice(1)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{uploadDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc.file_path)}
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          {doc.document_type === 'resume' && !isPrimary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetPrimary(doc.id)}
                              title="Set as primary resume"
                            >
                              Set as Primary
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

