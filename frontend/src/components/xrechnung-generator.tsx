"use client"

import { useState } from "react"
import { XRechnungForm } from "./xrechnung-form"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StepIndicator } from "./step-indicator"
import { Download, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, FileCheck } from "lucide-react"
import { PDFPreview } from "./pdf-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

type Step = "upload" | "validate" | "download"

interface ValidationResult {
  return_code: number
  message: string
  description: string
  error?: string
}

export default function XRechnungGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (file: File | null) => {
    setPdfFile(file)
  }

  const handleExtractData = async () => {
    if (!pdfFile) {
      toast({
        title: "Error",
        description: "Please upload a PDF file first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", pdfFile)

      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      // The upload endpoint now directly returns the extracted data
      const data = await response.json()
      setExtractedData(data)
      setCurrentStep("validate")

      toast({
        title: "Success",
        description: "Data extracted successfully from PDF",
      })
    } catch (error) {
      console.error("Error uploading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to upload PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (newData: any) => {
    setExtractedData(newData)
  }

  const handleGenerateXML = async () => {
    if (!extractedData) {
      toast({
        title: "Error",
        description: "No data available to generate XML",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:8000/convert/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extractedData),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const blob = await response.blob()
      setXmlBlob(blob)
      setCurrentStep("download")
      // Reset validation result when generating new XML
      setValidationResult(null)

      toast({
        title: "Success",
        description: "XRechnung XML generated successfully",
      })
    } catch (error) {
      console.error("Error generating XML:", error)
      toast({
        title: "Error",
        description: "Failed to generate XRechnung XML. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateXML = async () => {
    setIsValidating(true)

    try {
      const response = await fetch("http://localhost:8000/validate/", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const result = await response.json()
      setValidationResult(result)

      // Show toast based on validation result
      if (result.return_code === 0) {
        toast({
          title: "Validation Successful",
          description: "The XRechnung XML is valid.",
        })
      } else {
        toast({
          title: "Validation Failed",
          description: result.description || "The XRechnung XML is not valid.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error validating XML:", error)
      toast({
        title: "Error",
        description: "Failed to validate XRechnung XML. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleDownloadValidationReport = () => {
    // Create a link to download the validation report from the FastAPI backend
    const link = document.createElement("a")
    link.href = "http://localhost:8000/validation-report/"
    link.download = "validation-report.xml"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: "Validation report is being downloaded",
    })
  }

  const handleClear = () => {
    setPdfFile(null)
    setExtractedData(null)
    setXmlBlob(null)
    setCurrentStep("upload")
    setValidationResult(null)
    toast({
      title: "Form Cleared",
      description: "All data has been reset",
    })
  }

  const handleDownloadXML = () => {
    if (!xmlBlob || !pdfFile) return

    const url = URL.createObjectURL(xmlBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${extractedData?.header?.id || "invoice"}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Started",
      description: `XRechnung XML file for ${pdfFile.name} is being downloaded`,
    })
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "upload":
        return (
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <FileUploader onFileSelect={handleFileSelect} selectedFile={pdfFile} isLoading={isLoading} />
            </div>
          </div>
        )

      case "validate":
        return (
          <div className="flex-grow flex h-[calc(100vh-180px)]">
            <div className="w-1/2 overflow-auto p-6 border-r">
              <h2 className="text-xl font-bold mb-4">PDF Preview</h2>
              {pdfFile && <PDFPreview file={pdfFile} />}
            </div>
            <div className="w-1/2 overflow-auto p-6">
              <h2 className="text-xl font-bold mb-4">Validate Data</h2>
              {extractedData && <XRechnungForm data={extractedData} onChange={handleFormChange} />}
            </div>
          </div>
        )

      case "download":
        return (
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">XRechnung XML Generated</h2>
                <p className="text-muted-foreground">
                  Your XRechnung XML file has been generated successfully. You can download it now.
                </p>
              </div>

              <Button onClick={handleDownloadXML} className="w-full mb-4">
                <Download className="mr-2 h-4 w-4" />
                Download XRechnung XML
              </Button>

              <Button onClick={handleValidateXML} className="w-full mb-4" variant="outline" disabled={isValidating}>
                <FileCheck className="mr-2 h-4 w-4" />
                {isValidating ? "Validating..." : "Validate XRechnung"}
              </Button>

              {validationResult && (
                <Card className="mt-6 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Validation Results</h3>
                    <Alert
                      variant={validationResult.return_code === 0 ? "default" : "destructive"}
                      className={
                        validationResult.return_code === 0
                          ? "bg-green-700 border-green-800 text-white"
                          : "bg-red-700 border-red-800 text-white"
                      }
                    >
                      {validationResult.return_code === 0 ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-white" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2 text-white" />
                      )}
                      <AlertDescription>
                        <div className="font-medium">
                          {validationResult.return_code === 0 ? "Valid" : "Invalid"} (Code:{" "}
                          {validationResult.return_code})
                        </div>
                        <div className="mt-1">{validationResult.description}</div>
                      </AlertDescription>
                    </Alert>

                    {validationResult.return_code !== 0 && (
                      <Button
                        onClick={handleDownloadValidationReport}
                        className="w-full mt-4"
                        variant="secondary"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Validation Report
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {pdfFile && (
                <div className="mt-8 p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Original PDF</h3>
                  <div className="h-64 mb-4">
                    <PDFPreview file={pdfFile} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  const renderButtons = () => {
    return (
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleClear} disabled={isLoading || isValidating}>
          Clear
        </Button>

        <div className="flex gap-2">
          {currentStep !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep === "validate" ? "upload" : "validate")}
              disabled={isLoading || isValidating}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {currentStep === "upload" && (
            <Button onClick={handleExtractData} disabled={!pdfFile || isLoading}>
              {isLoading ? "Processing..." : "Extract Data"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {currentStep === "validate" && (
            <Button onClick={handleGenerateXML} disabled={!extractedData || isLoading}>
              {isLoading ? "Generating..." : "Generate XML"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold mb-6 text-center">XRechnung Generator</h1>
        <StepIndicator
          steps={[
            { id: "upload", label: "Upload PDF" },
            { id: "validate", label: "Validate Data" },
            { id: "download", label: "Download XML" },
          ]}
          currentStep={currentStep}
        />
      </div>

      {renderStepContent()}

      <div className="p-4 border-t bg-background shadow-md">{renderButtons()}</div>
    </div>
  )
}

