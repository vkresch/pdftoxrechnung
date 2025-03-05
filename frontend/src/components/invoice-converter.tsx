"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { ConversionStatus } from "./conversion-status"
import { ThemeToggle } from "./theme-toggle"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

export default function InvoiceConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [conversionComplete, setConversionComplete] = useState(false)

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile)
    setError(null)
    setResultUrl("")
    setConversionComplete(false)
  }

  const handleConversion = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
        setConversionComplete(true)
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to upload file" }))
        setError(errorData.message || "Failed to upload file")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setError("Error connecting to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Convert Invoice</CardTitle>
          <CardDescription>Upload a PDF invoice to convert it to E-Rechnung format</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader onFileSelect={handleFileSelect} selectedFile={file} isLoading={isLoading} />

          {file && (
            <div className="mt-4 flex items-center gap-2 rounded-md border p-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleFileSelect(null)} disabled={isLoading}>
                Remove
              </Button>
            </div>
          )}

          <ConversionStatus isLoading={isLoading} error={error} conversionComplete={conversionComplete} />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setError(null)
              setResultUrl("")
              setConversionComplete(false)
            }}
            disabled={!file || isLoading}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleConversion} disabled={!file || isLoading}>
              {isLoading ? "Converting..." : "Convert to E-Rechnung"}
            </Button>
            {resultUrl && (
              <Button variant="secondary" asChild>
                <a href={resultUrl} download="invoice.xml">
                  <Download className="mr-2 h-4 w-4" />
                  Download XML
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

