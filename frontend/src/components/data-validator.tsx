"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PDFViewer } from "./pdf-viewer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2 } from "lucide-react"

interface DataValidatorProps {
  data: any
  onValidate: (validatedData: any) => void
  pdfFile: File
}

export function DataValidator({ data, onValidate, pdfFile }: DataValidatorProps) {
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

  const addLineItem = () => {
    setValidatedData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData))
      const newItem = {
        "@type": "Item",
        line_id: (newData.trade.items.length + 1).toString(),
        product_name: "",
        agreement_net_price: 0,
        quantity: 1,
        delivery_details: 0,
        settlement_tax: {
          "@type": "Tax",
          category: "E",
          rate: 0,
          amount: 0,
        },
        total_amount: 0,
      }
      newData.trade.items.push(newItem)
      return newData
    })
  }

  const removeLineItem = (index: number) => {
    setValidatedData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData))
      newData.trade.items.splice(index, 1)
      // Update line_id for remaining items
      newData.trade.items.forEach((item: any, idx: number) => {
        item.line_id = (idx + 1).toString()
      })
      return newData
    })
  }

  const renderInputs = (obj: any, path = "") => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      if (typeof value === "object" && value !== null) {
        if (key === "items" && Array.isArray(value)) {
          return (
            <div key={currentPath} className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Items</h3>
              {value.map((item: any, index: number) => (
                <div key={`${currentPath}.${index}`} className="mb-4 p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-md font-medium">Item {index + 1}</h4>
                    <Button variant="destructive" size="sm" onClick={() => removeLineItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderInputs(item, `${currentPath}.${index}`)}
                </div>
              ))}
              <Button onClick={addLineItem} className="mt-2">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          )
        }
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
    <div className="flex h-[calc(100vh-200px)] w-full">
      <div className="w-2/5 pr-4">
        <PDFViewer file={pdfFile} />
      </div>
      <div className="w-3/5 pl-4">
        <ScrollArea className="h-full pr-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Validate Extracted Data</h2>
            <p className="text-sm text-muted-foreground">Please review and update the extracted data if necessary.</p>
          </div>
          {renderInputs(validatedData)}
          <Button onClick={() => onValidate(validatedData)} className="mt-4">
            Generate XRechnung
          </Button>
        </ScrollArea>
      </div>
    </div>
  )
}

