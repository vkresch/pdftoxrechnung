"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2 } from "lucide-react"

interface XRechnungFormProps {
  data: any
  onChange: (data: any) => void
}

export function XRechnungForm({ data, onChange }: XRechnungFormProps) {
  const [formState, setFormState] = useState(data)

  useEffect(() => {
    // Calculate totals whenever form state changes
    calculateTotals()
  }, [formState.items])

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split(".")
    setFormState((prevState: any) => {
      const newState = { ...prevState }
      let current = newState

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value

      // If changing item quantity or price, update the total price
      if (path.includes("items") && (path.includes("quantity") || path.includes("unitPrice"))) {
        const itemIndex = Number.parseInt(path.split(".")[1])
        const item = newState.items[itemIndex]
        item.totalPrice = item.quantity * item.unitPrice
      }

      return newState
    })

    onChange(formState)
  }

  const calculateTotals = () => {
    const totalAmount = formState.items.reduce(
      (sum: number, item: any) => sum + Number.parseFloat(item.totalPrice || 0),
      0,
    )

    const taxAmount = formState.items.reduce(
      (sum: number, item: any) =>
        sum + (Number.parseFloat(item.totalPrice || 0) * Number.parseFloat(item.taxRate || 0)) / 100,
      0,
    )

    setFormState((prevState: any) => ({
      ...prevState,
      totalAmount: totalAmount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
    }))

    onChange(formState)
  }

  const addItem = () => {
    setFormState((prevState: any) => ({
      ...prevState,
      items: [
        ...prevState.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          taxRate: 19,
        },
      ],
    }))
  }

  const removeItem = (index: number) => {
    setFormState((prevState: any) => ({
      ...prevState,
      items: prevState.items.filter((_: any, i: number) => i !== index),
    }))
  }

  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <div className="space-y-6 pr-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={formState.invoiceNumber}
                  onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formState.invoiceDate}
                  onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formState.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sellerName">Name</Label>
                <Input
                  id="sellerName"
                  value={formState.seller.name}
                  onChange={(e) => handleInputChange("seller.name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerAddress">Address</Label>
                <Input
                  id="sellerAddress"
                  value={formState.seller.address}
                  onChange={(e) => handleInputChange("seller.address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerTaxId">Tax ID</Label>
                <Input
                  id="sellerTaxId"
                  value={formState.seller.taxId}
                  onChange={(e) => handleInputChange("seller.taxId", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="buyerName">Name</Label>
                <Input
                  id="buyerName"
                  value={formState.buyer.name}
                  onChange={(e) => handleInputChange("buyer.name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerAddress">Address</Label>
                <Input
                  id="buyerAddress"
                  value={formState.buyer.address}
                  onChange={(e) => handleInputChange("buyer.address", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <Button onClick={addItem} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {formState.items.map((item: any, index: number) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {formState.items.length > 1 && (
                    <Button variant="destructive" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-description`}>Description</Label>
                    <Input
                      id={`item-${index}-description`}
                      value={item.description}
                      onChange={(e) => handleInputChange(`items.${index}.description`, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(`items.${index}.quantity`, Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-unitPrice`}>Unit Price (€)</Label>
                    <Input
                      id={`item-${index}-unitPrice`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleInputChange(`items.${index}.unitPrice`, Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-taxRate`}>Tax Rate (%)</Label>
                    <Input
                      id={`item-${index}-taxRate`}
                      type="number"
                      min="0"
                      max="100"
                      value={item.taxRate}
                      onChange={(e) => handleInputChange(`items.${index}.taxRate`, Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-totalPrice`}>Total Price (€)</Label>
                    <Input id={`item-${index}-totalPrice`} type="number" step="0.01" value={item.totalPrice} disabled />
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 ml-auto">
                <Label htmlFor="taxAmount">Tax Amount (€)</Label>
                <Input id="taxAmount" value={formState.taxAmount} disabled />
              </div>
              <div className="col-span-1">
                <Label htmlFor="totalAmount">Total Amount (€)</Label>
                <Input id="totalAmount" value={formState.totalAmount} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

