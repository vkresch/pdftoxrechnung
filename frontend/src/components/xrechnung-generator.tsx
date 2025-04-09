"use client"

import { useState, useEffect } from "react"
import { XRechnungForm } from "./xrechnung-form"
import { FileUploader } from "./file-uploader"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StepIndicator } from "./step-indicator"
import { Download, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, FileCheck } from "lucide-react"
import { PDFPreview } from "./pdf-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { ValidationMessageDisplay } from "./validation-message-display"

type Step = "upload" | "validate" | "download"

interface ValidationResult {
  return_code: number
  message: string
  description: string
  error?: string
  validationMessages?: ValidationMessage[]
  errorCount?: number
  warningCount?: number
}

interface ValidationMessage {
  id: string
  level: "error" | "warning"
  code: string
  message: string
  xpathLocation?: string
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

  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // This code runs only on the client
    let storedId = localStorage.getItem("session_id")
    if (!storedId) {
      storedId = crypto.randomUUID()
      localStorage.setItem("session_id", storedId)
    }
    setSessionId(storedId)
  }, [])

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

      if (!sessionId) {
        console.error("No session ID available yet.")
        return
      }

      const response = await fetch("/api/upload/", {
        method: "POST",
        body: formData,
        headers: {
          "X-Session-ID": sessionId,
        },
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
      if (!sessionId) {
        console.error("No session ID available yet.")
        return
      }

      const response = await fetch("/api/convert/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
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

  // Update the validation result display to show a summary of errors and warnings
  const handleValidateXML = async () => {
    setIsValidating(true)

    try {
      if (!sessionId) {
        console.error("No session ID available yet.")
        return
      }

      // First call the validation endpoint
      const response = await fetch("/api/validate/", {
        method: "POST",
        headers: {
          "X-Session-ID": sessionId,
        },
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const result = await response.json()

      // Now fetch the XML report file
      const reportResponse = await fetch("/api/validation-report-content/", {
        method: "GET",
        headers: {
          "X-Session-ID": sessionId,
        },
      })

      if (!reportResponse.ok) {
        throw new Error(`Failed to fetch validation report: ${reportResponse.status}`)
      }

      const reportXml = await reportResponse.text()
      const validationMessages = parseValidationReport(reportXml)

      // Count errors and warnings
      const errorCount = validationMessages.filter((msg) => msg.level === "error").length
      const warningCount = validationMessages.filter((msg) => msg.level === "warning").length

      // Add the validation messages to the result
      const enhancedResult = {
        ...result,
        validationMessages,
        errorCount,
        warningCount,
      }

      setValidationResult(enhancedResult)

      // Show toast based on validation result with detailed messages
      if (errorCount === 0 && warningCount === 0) {
        toast({
          title: "Validation Successful",
          description: "The XRechnung XML is valid.",
        })
      } else {
        // Display validation messages in the toast
        toast({
          title: `Validation ${errorCount > 0 ? "Failed" : "Warning"}`,
          description: (
            <div className="mt-2 space-y-2 max-h-[300px] overflow-auto text-sm">
              <div className="font-medium">
                {errorCount > 0
                  ? `Found ${errorCount} error${errorCount > 1 ? "s" : ""} and ${warningCount} warning${warningCount > 1 ? "s" : ""}.`
                  : `Found ${warningCount} warning${warningCount > 1 ? "s" : ""}.`}
              </div>
              <div>{result.description || "The XRechnung XML is not valid."}</div>

              {validationMessages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <ValidationMessageDisplay
                    messages={validationMessages}
                    maxHeight="200px"
                    showLocations={false}
                    className={errorCount > 0 ? "text-white" : ""}
                  />
                </div>
              )}
            </div>
          ),
          variant: errorCount > 0 ? "destructive" : "default",
          duration: 10000, // Longer duration to give time to read
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

  // Add a function to parse the XML validation report
  const parseValidationReport = (xmlString: string): ValidationMessage[] => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, "text/xml")

    // Handle parsing errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      console.error("Error parsing XML report")
      return []
    }

    const messages: ValidationMessage[] = []

    // Find all message elements in the report
    // We need to handle the namespace in the XML
    // Try different approaches to handle namespaces in different browsers
    let messageElements: HTMLCollectionOf<Element> | NodeListOf<Element> = xmlDoc.getElementsByTagName("rep:message")

    // If no elements found with namespace prefix, try without prefix
    if (messageElements.length === 0) {
      messageElements = xmlDoc.getElementsByTagName("message")
    }

    // If still no elements found, try using getElementsByTagNameNS
    if (messageElements.length === 0) {
      const allElements = xmlDoc.getElementsByTagName("*")
      const filteredElements: Element[] = []

      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i]
        if (element.localName === "message" || element.nodeName.includes("message")) {
          filteredElements.push(element)
        }
      }

      for (let i = 0; i < filteredElements.length; i++) {
        const element = filteredElements[i]

        const message: ValidationMessage = {
          id: element.getAttribute("id") || `msg-${i}`,
          level: (element.getAttribute("level") as "error" | "warning") || "warning",
          code: element.getAttribute("code") || "",
          message: element.textContent || "",
          xpathLocation: element.getAttribute("xpathLocation") || undefined,
        }

        messages.push(message)
      }

      return messages
    }

    // Process the found message elements
    for (let i = 0; i < messageElements.length; i++) {
      const element = messageElements[i]

      const message: ValidationMessage = {
        id: element.getAttribute("id") || `msg-${i}`,
        level: (element.getAttribute("level") as "error" | "warning") || "warning",
        code: element.getAttribute("code") || "",
        message: element.textContent || "",
        xpathLocation: element.getAttribute("xpathLocation") || undefined,
      }

      messages.push(message)
    }

    return messages
  }

  const handleDownloadValidationReport = async () => {
    if (!sessionId) {
      toast({
        title: "Session Error",
        description: "Session ID not found. Please refresh the page.",
        variant: "destructive",
      })
      return
    }
  
    try {
      const response = await fetch("/api/validation-report/", {
        method: "GET",
        headers: {
          "X-Session-ID": sessionId,
        },
      })
  
      if (!response.ok) {
        throw new Error("Failed to download report")
      }
  
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
  
      const link = document.createElement("a")
      link.href = url
      link.download = "validation-report.xml"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
  
      toast({
        title: "Download Started",
        description: "Validation report is being downloaded",
      })
    } catch (err) {
      console.error("Download failed:", err)
      toast({
        title: "Download Failed",
        description: "Unable to download the validation report",
        variant: "destructive",
      })
    }
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
          <div className="flex-grow flex h-[calc(100vh-220px)]">
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
                <h2 className="text-2xl font-bold mb-2">XRechnung XML generiert</h2>
                <p className="text-muted-foreground">
                  Ihre XRechnung XML-Datei wurde erfolgreich erstellt. Sie können sie jetzt herunterladen.
                </p>
              </div>

              <Button onClick={handleDownloadXML} className="w-full mb-4">
                <Download className="mr-2 h-4 w-4" />
                XRechnung herunterladen
              </Button>

              <Button onClick={handleValidateXML} className="w-full mb-4" variant="outline" disabled={isValidating}>
                <FileCheck className="mr-2 h-4 w-4" />
                {isValidating ? "Validierung läuft..." : "XRechnung validieren"}
              </Button>

              {validationResult && (
                <Card className="mt-6 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">Validierungsergebnisse</h3>
                    <Alert
                      variant="default"
                      className={
                        validationResult.errorCount && validationResult.errorCount > 0
                          ? "bg-red-700 border-red-800 text-white"
                          : validationResult.warningCount && validationResult.warningCount > 0
                            ? "bg-amber-600 border-amber-700 text-white"
                            : "bg-green-700 border-green-800 text-white"
                      }
                    >
                      {!validationResult.errorCount && !validationResult.warningCount ? (
                        <CheckCircle className="h-4 w-4 mr-2 text-white" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2 text-white" />
                      )}
                      <AlertDescription>
                        <div className="font-medium">
                          {!validationResult.errorCount && !validationResult.warningCount
                            ? "Valid"
                            : validationResult.errorCount && validationResult.errorCount > 0
                              ? `Invalid - ${validationResult.errorCount} error${validationResult.errorCount > 1 ? "s" : ""}, ${validationResult.warningCount || 0} warning${(validationResult.warningCount || 0) > 1 ? "s" : ""}`
                              : `Valid with warnings - ${validationResult.warningCount} warning${(validationResult.warningCount || 0) > 1 ? "s" : ""}`}
                          {validationResult.return_code !== undefined && ` (Code: ${validationResult.return_code})`}
                        </div>
                        <div className="mt-1">{validationResult.description}</div>

                        {/* Display validation messages */}
                        {validationResult.validationMessages && validationResult.validationMessages.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="font-medium mb-1 text-white">Validation Messages:</div>
                            <ValidationMessageDisplay
                              messages={validationResult.validationMessages}
                              className="text-white"
                              showLocations={true}
                            />
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {((validationResult.errorCount && validationResult.errorCount > 0) ||
                      (validationResult.warningCount && validationResult.warningCount > 0)) && (
                      <Button
                        onClick={handleDownloadValidationReport}
                        className="w-full mt-4"
                        variant="secondary"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Bericht herunterladen
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
      <div className="p-2 border-b bg-background sticky shadow-md top-14 bg-secondary z-50">
        <StepIndicator
          steps={[
            { id: "upload", label: "PDF hochladen" },
            { id: "validate", label: "Daten validieren" },
            { id: "download", label: "Download XRechnung" },
          ]}
          currentStep={currentStep}
        />
      </div>

      {renderStepContent()}

      <div className="p-2 border-t bg-background bg-secondary shadow-md sticky bottom-0 z-50">{renderButtons()}</div>
    </div>
  )
}

