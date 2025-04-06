"use client"

import type React from "react"

import { useState, useRef, type DragEvent } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  isLoading: boolean
}

export function FileUploader({ onFileSelect, selectedFile, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === "application/pdf") {
        onFileSelect(file)
      } else {
        alert("Please upload a PDF file")
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file.type === "application/pdf") {
        onFileSelect(file)
      } else {
        alert("Please upload a PDF file")
      }
    }
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        selectedFile ? "bg-muted/50" : "",
        "hover:bg-muted/50 cursor-pointer",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
        disabled={isLoading}
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        ) : (
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
        )}
        <h3 className="text-xl font-semibold">
          {isLoading ? "Rechnung wird verarbeitet" : selectedFile ? "Rechnung ersetzen" : "Rechnung hochladen"}
        </h3>
        <p className="text-muted-foreground">
          {isLoading ? "Bitte warten während wir die Daten extrahieren" : "Drag und drop deine PDF Rechnung oder klicke um zu wählen"}
        </p>

        {selectedFile && !isLoading && (
          <div className="mt-4 p-3 bg-background rounded-md border w-full">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>
    </div>
  )
}

