"use client"

import { useState, useEffect } from "react"

interface PDFViewerProps {
  file: File
}

export function PDFViewer({ file }: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPdfUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full border rounded-lg p-4">
        <p>Loading PDF...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden">
      <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full border-0" title="PDF Viewer" />
    </div>
  )
}

