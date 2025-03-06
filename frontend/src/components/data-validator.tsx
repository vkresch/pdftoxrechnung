"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DataValidatorProps {
  data: any
  onValidate: (validatedData: any) => void
}

export function DataValidator({ data, onValidate }: DataValidatorProps) {
  const [validatedData, setValidatedData] = useState(data)

  const handleInputChange = (path: string, value: string) => {
    const keys = path.split(".")
    setValidatedData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData))
      let current = newData
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const renderInputs = (obj: any, path = "") => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      if (typeof value === "object" && value !== null) {
        return (
          <div key={currentPath} className="mb-4">
            <h3 className="text-lg font-semibold mb-2">{key}</h3>
            {renderInputs(value, currentPath)}
          </div>
        )
      } else {
        return (
          <div key={currentPath} className="mb-4">
            <Label htmlFor={currentPath}>{key}</Label>
            <Input
              id={currentPath}
              value={value as string}
              onChange={(e) => handleInputChange(currentPath, e.target.value)}
            />
          </div>
        )
      }
    })
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Validate Extracted Data</h2>
        <p className="text-sm text-muted-foreground">Please review and update the extracted data if necessary.</p>
      </div>
      {renderInputs(validatedData)}
      <Button onClick={() => onValidate(validatedData)}>Generate XRechnung</Button>
    </div>
  )
}

