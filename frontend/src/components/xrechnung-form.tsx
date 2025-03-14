"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface XRechnungFormProps {
  data: any
  onChange: (data: any) => void
}

export function XRechnungForm({ data, onChange }: XRechnungFormProps) {
  const [formState, setFormState] = useState(data)

  useEffect(() => {
    // Pass the updated form state to the parent component
    onChange(formState)
  }, [formState, onChange])

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split(".")
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState)) // Deep clone to avoid mutation issues
      let current = newState

      for (let i = 0; i < keys.length - 1; i++) {
        if (current[keys[i]] === undefined) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value

      // If changing item quantity or price, update the total price
      if (path.includes("items") && (path.includes("quantity") || path.includes("agreement_net_price"))) {
        const itemIndex = Number.parseInt(path.split(".")[2])
        const item = newState.trade.items[itemIndex]
        item.total_amount = item.quantity * item.agreement_net_price
        item.delivery_details = item.total_amount
      }

      // Update monetary summation totals
      if (path.includes("items")) {
        updateTotals(newState)
      }

      return newState
    })
  }

  const updateTotals = (state: any) => {
    // Calculate total amount from items
    const totalAmount = state.trade.items.reduce(
      (sum: number, item: any) => sum + Number.parseFloat(item.total_amount || 0),
      0,
    )

    // Update monetary summation
    if (state.trade.settlement && state.trade.settlement.monetary_summation) {
      state.trade.settlement.monetary_summation.total = totalAmount
    }

    // Calculate tax total if applicable
    const taxTotal = state.trade.items.reduce((sum: number, item: any) => {
      if (item.settlement_tax && item.settlement_tax.rate) {
        return (
          sum + (Number.parseFloat(item.total_amount || 0) * Number.parseFloat(item.settlement_tax.rate || 0)) / 100
        )
      }
      return sum
    }, 0)

    if (state.trade.settlement && state.trade.settlement.monetary_summation) {
      state.trade.settlement.monetary_summation.tax_total = taxTotal
    }
  }

  const addItem = () => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      const newItemId = (newState.trade.items.length + 1).toString()

      newState.trade.items.push({
        "@type": "Item",
        line_id: newItemId,
        product_name: "",
        agreement_net_price: 0,
        quantity: 1,
        delivery_details: 0,
        period_start: "",
        period_end: "",
        settlement_tax: {
          "@type": "Tax",
          category: "E",
          rate: 0,
          amount: 0,
        },
        total_amount: 0,
      })

      updateTotals(newState)
      return newState
    })
  }

  const removeItem = (index: number) => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      newState.trade.items.splice(index, 1)

      // Update line_id for remaining items
      newState.trade.items.forEach((item: any, idx: number) => {
        item.line_id = (idx + 1).toString()
      })

      updateTotals(newState)
      return newState
    })
  }

  // Check if the data has the expected structure
  if (!formState || !formState.header || !formState.trade) {
    return <div>Invalid data format</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <div className="space-y-6 pr-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceId">Invoice Number</Label>
                <Input
                  id="invoiceId"
                  value={formState.header.id}
                  onChange={(e) => handleInputChange("header.id", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formState.header.issue_date_time}
                  onChange={(e) => handleInputChange("header.issue_date_time", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceType">Invoice Type</Label>
                <Input
                  id="invoiceType"
                  value={formState.header.type_code}
                  onChange={(e) => handleInputChange("header.type_code", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoiceName">Invoice Name</Label>
                <Input
                  id="invoiceName"
                  value={formState.header.name}
                  onChange={(e) => handleInputChange("header.name", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="invoiceNotes">Notes</Label>
                <Textarea
                  id="invoiceNotes"
                  value={formState.header.notes ? formState.header.notes.join("\n") : ""}
                  onChange={(e) => handleInputChange("header.notes", e.target.value.split("\n"))}
                  className="min-h-[80px]"
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
                  value={formState.trade.agreement.seller.name}
                  onChange={(e) => handleInputChange("trade.agreement.seller.name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerCountry">Country</Label>
                <Input
                  id="sellerCountry"
                  value={formState.trade.agreement.seller.address?.country || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.country", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerState">State</Label>
                <Input
                  id="sellerState"
                  value={formState.trade.agreement.seller.address?.state || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.state", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerStreet">Street</Label>
                <Input
                  id="sellerStreet"
                  value={formState.trade.agreement.seller.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.street_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerCityName">City</Label>
                <Input
                  id="sellerCityName"
                  value={formState.trade.agreement.seller.address?.city_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.city_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerPostalZone">PLZ</Label>
                <Input
                  id="sellerPostalZone"
                  value={formState.trade.agreement.seller.address?.postal_zone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.postal_zone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sellerTaxId">Tax ID</Label>
                <Input
                  id="sellerTaxId"
                  value={formState.trade.agreement.seller.tax_id}
                  onChange={(e) => handleInputChange("trade.agreement.seller.tax_id", e.target.value)}
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
                  value={formState.trade.agreement.buyer.name}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerCountry">Country</Label>
                <Input
                  id="buyerCountry"
                  value={formState.trade.agreement.buyer.address?.country || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.country", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerState">State</Label>
                <Input
                  id="buyerState"
                  value={formState.trade.agreement.buyer.address?.state || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.state", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerStreet">Street</Label>
                <Input
                  id="buyerStreet"
                  value={formState.trade.agreement.buyer.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.street_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerCityName">City</Label>
                <Input
                  id="buyerCityName"
                  value={formState.trade.agreement.buyer.address?.city_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.city_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerPostalZone">PLZ</Label>
                <Input
                  id="buyerPostalZone"
                  value={formState.trade.agreement.buyer.address?.postal_zone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.postal_zone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerTaxId">Tax ID</Label>
                <Input
                  id="buyerTaxId"
                  value={formState.trade.agreement.buyer.tax_id}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.tax_id", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currencyCode">Currency</Label>
                <Input
                  id="currencyCode"
                  value={formState.trade.settlement.currency_code}
                  onChange={(e) => handleInputChange("trade.settlement.currency_code", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentType">Payment Type</Label>
                <Input
                  id="paymentType"
                  value={formState.trade.settlement.payment_means.type_code}
                  onChange={(e) => handleInputChange("trade.settlement.payment_means.type_code", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Due Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formState.trade.settlement.advance_payment_date}
                  onChange={(e) => handleInputChange("trade.settlement.advance_payment_date", e.target.value)}
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

            {formState.trade.items.map((item: any, index: number) => (
              <div key={index} className="mb-6 p-4 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Item {item.line_id}</h4>
                  {formState.trade.items.length > 1 && (
                    <Button variant="destructive" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor={`item-${index}-name`}>Product Name</Label>
                    <Input
                      id={`item-${index}-name`}
                      value={item.product_name}
                      onChange={(e) => handleInputChange(`trade.items.${index}.product_name`, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                    <Input
                      id={`item-${index}-quantity`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(`trade.items.${index}.quantity`, Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-price`}>Unit Price (€)</Label>
                    <Input
                      id={`item-${index}-price`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.agreement_net_price}
                      onChange={(e) =>
                        handleInputChange(`trade.items.${index}.agreement_net_price`, Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-period-start`}>Period Start</Label>
                    <Input
                      id={`item-${index}-period-start`}
                      type="date"
                      value={item.period_start || ""}
                      onChange={(e) => handleInputChange(`trade.items.${index}.period_start`, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-period-end`}>Period End</Label>
                    <Input
                      id={`item-${index}-period-end`}
                      type="date"
                      value={item.period_end || ""}
                      onChange={(e) => handleInputChange(`trade.items.${index}.period_end`, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-tax-rate`}>Tax Rate (%)</Label>
                    <Input
                      id={`item-${index}-tax-rate`}
                      type="number"
                      min="0"
                      max="100"
                      value={item.settlement_tax.rate}
                      onChange={(e) =>
                        handleInputChange(`trade.items.${index}.settlement_tax.rate`, Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-total`}>Total Price (€)</Label>
                    <Input id={`item-${index}-total`} type="number" step="0.01" value={item.total_amount} disabled />
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1 ml-auto">
                <Label htmlFor="taxTotal">Tax Amount (€)</Label>
                <Input id="taxTotal" value={formState.trade.settlement.monetary_summation.tax_total} disabled />
              </div>
              <div className="col-span-1">
                <Label htmlFor="totalAmount">Total Amount (€)</Label>
                <Input id="totalAmount" value={formState.trade.settlement.monetary_summation.total} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

