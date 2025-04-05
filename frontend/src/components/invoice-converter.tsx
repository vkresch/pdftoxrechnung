"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { DataValidator } from "./data-validator"
import { ConversionStatus } from "./conversion-status"
import { ThemeToggle } from "./theme-toggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"

type Step = "upload" | "validate" | "convert"

export default function InvoiceConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resultUrl, setResultUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [conversionComplete, setConversionComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile)
    setError(null)
    setResultUrl("")
    setConversionComplete(false)
    setExtractedData(null)
    setCurrentStep("upload")
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedData(data)
        setCurrentStep("validate")
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

  const handleConversion = async (validatedData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/convert/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
        setConversionComplete(true)
        setCurrentStep("convert")
      } else {
        const errorData = await response.json().catch(() => ({ message: "Failed to convert data" }))
        setError(errorData.message || "Failed to convert data")
      }
    } catch (error) {
      console.error("Error converting data:", error)
      setError("Error connecting to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Convert PDF to XRechnung</CardTitle>
          <CardDescription>
            {currentStep === "upload" && "Upload a PDF invoice to extract data"}
            {currentStep === "validate" && "Validate and extend the extracted data"}
            {currentStep === "convert" && "Generate XRechnung XML"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === "upload" && (
            <FileUploader onFileSelect={handleFileSelect} selectedFile={file} isLoading={isLoading} />
          )}

          {currentStep === "validate" && extractedData && file && (
            <DataValidator data={extractedData} onValidate={handleConversion} pdfFile={file} />
          )}

          {file && currentStep === "upload" && (
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
              setExtractedData(null)
              setCurrentStep("upload")
            }}
            disabled={isLoading}
          >
            Clear
          </Button>
          <div className="flex gap-2">
            {currentStep === "upload" && (
              <Button onClick={handleUpload} disabled={!file || isLoading}>
                {isLoading ? "Uploading..." : "Extract Data"}
              </Button>
            )}
            {resultUrl && (
              <Button variant="secondary" asChild>
                <a href={resultUrl} download="invoice.xml">
                  <Download className="mr-2 h-4 w-4" />
                  Download XRechnung XML
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

