"use client"

import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConversionStatusProps {
  isLoading: boolean
  error: string | null
  conversionComplete: boolean
}

export function ConversionStatus({ isLoading, error, conversionComplete }: ConversionStatusProps) {
  if (!isLoading && !error && !conversionComplete) {
    return null
  }

  return (
    <div className="mt-4">
      {isLoading && (
        <Alert variant="default" className="bg-muted">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
          <AlertDescription>Converting your invoice... Please wait.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {conversionComplete && (
        <Alert variant="default" className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle className="h-4 w-4 mr-2" />
          <AlertDescription>Conversion complete! Your E-Rechnung is ready to download.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

