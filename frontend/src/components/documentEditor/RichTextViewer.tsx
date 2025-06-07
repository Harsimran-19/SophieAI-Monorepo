"use client"

import { useEffect } from "react"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

interface RichTextViewerProps {
  content: string // this should be HTML
  onEditorReady?: (editor: ReturnType<typeof useEditor> | null) => void
  editable?: boolean
}

export default function RichTextViewer({
  content,
  onEditorReady,
  editable = false,
}: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editable,
  })

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  return (
    <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0.5 [&>*]:my-0.5">
      <EditorContent editor={editor} />
    </div>
  )
}
