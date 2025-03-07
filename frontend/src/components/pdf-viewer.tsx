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
    return <div>Loading PDF...</div>
  }

  return (
    <div className="w-full h-full">
      <iframe src={`${pdfUrl}#toolbar=0`} className="w-full h-full border-0" title="PDF Viewer" />
    </div>
  )
}

