"use client"

import { useState } from "react"
import { PDFPreview } from "./pdf-preview"
import { XRechnungForm } from "./xrechnung-form"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StepIndicator } from "./step-indicator"
import { Download, ArrowLeft, ArrowRight } from "lucide-react"

type Step = "upload" | "validate" | "download"

export default function XRechnungGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [xmlBlob, setXmlBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
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
      // In a real application, this would call your backend API to extract data
      // For this example, we'll simulate a response with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock extracted data
      setExtractedData({
        invoiceNumber: "INV-2023-001",
        invoiceDate: "2023-03-15",
        dueDate: "2023-04-15",
        seller: {
          name: "Example Company GmbH",
          address: "Musterstraße 123, 10115 Berlin",
          taxId: "DE123456789",
        },
        buyer: {
          name: "Client Corporation AG",
          address: "Kundenweg 45, 60329 Frankfurt",
        },
        items: [
          {
            description: "Professional Services",
            quantity: 1,
            unitPrice: 1000,
            totalPrice: 1000,
            taxRate: 19,
          },
        ],
        totalAmount: 1000,
        taxAmount: 190,
      })

      setCurrentStep("validate")
      toast({
        title: "Success",
        description: "Data extracted successfully",
      })
    } catch (error) {
      console.error("Error extracting data:", error)
      toast({
        title: "Error",
        description: "Failed to extract data from PDF",
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
      // In a real application, this would call your backend API
      // to generate the XML based on the validated data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock XML blob
      const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<ubl:Invoice xmlns:ubl="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
             xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
             xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${extractedData.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${extractedData.invoiceDate}</cbc:IssueDate>
  <cbc:DueDate>${extractedData.dueDate}</cbc:DueDate>
  <!-- More XML content would be here in a real application -->
</ubl:Invoice>`

      const blob = new Blob([xmlString], { type: "application/xml" })
      setXmlBlob(blob)
      setCurrentStep("download")

      toast({
        title: "Success",
        description: "XRechnung XML generated successfully",
      })
    } catch (error) {
      console.error("Error generating XML:", error)
      toast({
        title: "Error",
        description: "Failed to generate XRechnung XML",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPdfFile(null)
    setExtractedData(null)
    setXmlBlob(null)
    setCurrentStep("upload")
    toast({
      title: "Form Cleared",
      description: "All data has been reset",
    })
  }

  const handleDownloadXML = () => {
    if (!xmlBlob) return

    const url = URL.createObjectURL(xmlBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${extractedData?.invoiceNumber || "invoice"}.xml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Started",
      description: "Your XRechnung XML file is being downloaded",
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
            {/* PDF Preview - 50% width */}
            <div className="w-1/2 overflow-auto p-6 border-r">
              <h2 className="text-xl font-bold mb-4">PDF Preview</h2>
              {pdfFile && <PDFPreview file={pdfFile} />}
            </div>

            {/* Form - 50% width */}
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
        <Button variant="outline" onClick={handleClear} disabled={isLoading}>
          Clear
        </Button>

        <div className="flex gap-2">
          {currentStep !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep === "validate" ? "upload" : "validate")}
              disabled={isLoading}
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
      {/* Header with step indicator */}
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

      {/* Main content area */}
      {renderStepContent()}

      {/* Fixed footer with buttons */}
      <div className="p-4 border-t bg-background shadow-md">{renderButtons()}</div>
    </div>
  )
}

