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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  // Handle input changes for any field in the form
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

      // If changing item quantity, price, or tax rate, update the total price and tax
      if (
        path.includes("items") &&
        (path.includes("quantity") || path.includes("agreement_net_price") || path.includes("settlement_tax.rate"))
      ) {
        const itemIndex = Number.parseInt(path.split(".")[2])
        const item = newState.trade.items[itemIndex]
        item.total_amount = Number.parseFloat((item.quantity * item.agreement_net_price).toFixed(2))
        item.delivery_details = item.total_amount

        // Update all totals including tax calculations
        updateTotals(newState)
      }

      return newState
    })
  }

  // Update the totals for the invoice
  const updateTotals = (state: any) => {
    // First update each line item's tax amount
    state.trade.items.forEach((item: any) => {
      if (item.settlement_tax && item.settlement_tax.rate !== undefined) {
        // Calculate tax amount for this line item
        const taxRate = Number(item.settlement_tax.rate) / 100 // Convert percentage to decimal
        const taxAmount = Number(item.total_amount) * taxRate

        // Update the tax amount in the item
        item.settlement_tax.amount = Number.parseFloat(taxAmount.toFixed(2))
      }
    })

    // Calculate total amount from items
    const totalAmount = state.trade.items.reduce((sum: number, item: any) => sum + Number(item.total_amount || 0), 0)

    // Calculate tax total by summing up all individual tax amounts
    const taxTotal = state.trade.items.reduce(
      (sum: number, item: any) => sum + Number(item.settlement_tax?.amount || 0),
      0,
    )

    // Update monetary summation
    if (state.trade.settlement && state.trade.settlement.monetary_summation) {
      state.trade.settlement.monetary_summation.net_total = Number.parseFloat(totalAmount.toFixed(2))
      state.trade.settlement.monetary_summation.tax_total = Number.parseFloat(taxTotal.toFixed(2))

      // Calculate and update the grand total (including tax)
      state.trade.settlement.monetary_summation.grand_total = Number.parseFloat((totalAmount + taxTotal).toFixed(2))
    }

    // Update trade tax if it exists
    if (state.trade.settlement && state.trade.settlement.trade_tax && state.trade.settlement.trade_tax.length > 0) {
      state.trade.settlement.trade_tax[0].amount = Number.parseFloat(taxTotal.toFixed(2))
    }
  }

  // Add a new item to the invoice
  const addItem = () => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      const newItemId = (newState.trade.items.length + 1).toString()

      newState.trade.items.push({
        type: "Item",
        line_id: newItemId,
        product_name: "",
        period_start: new Date().toISOString().split("T")[0],
        period_end: new Date().toISOString().split("T")[0],
        agreement_net_price: 0,
        quantity: 1,
        delivery_details: 0,
        settlement_tax: {
          type: "Tax",
          category: "E",
          rate: 19,
          amount: 0,
        },
        total_amount: 0,
      })

      updateTotals(newState)
      return newState
    })
  }

  // Remove an item from the invoice
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
        {/* Context Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Context</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guideline_parameter">Guideline Parameter</Label>
                <Input
                  id="guideline_parameter"
                  value={formState.context?.guideline_parameter || ""}
                  onChange={(e) => handleInputChange("context.guideline_parameter", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details Section */}
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
              <div>
                <Label htmlFor="invoiceLanguage">Language</Label>
                <Input
                  id="invoiceLanguage"
                  value={formState.header.languages}
                  onChange={(e) => handleInputChange("header.languages", e.target.value)}
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

        {/* Seller Information Section */}
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
                <Label htmlFor="sellerContactName">Contact Name</Label>
                <Input
                  id="sellerContactName"
                  value={formState.trade.agreement.seller.contact_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.contact_name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerCountry">Country</Label>
                  <Input
                    id="sellerCountry"
                    value={formState.trade.agreement.seller.address?.country || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.address.country", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerCountryCode">Country Code</Label>
                  <Input
                    id="sellerCountryCode"
                    value={formState.trade.agreement.seller.address?.country_code || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.address.country_code", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sellerStreet">Street</Label>
                <Input
                  id="sellerStreet"
                  value={formState.trade.agreement.seller.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.street_name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerCity">City</Label>
                  <Input
                    id="sellerCity"
                    value={formState.trade.agreement.seller.address?.city_name || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.address.city_name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerPostalCode">Postal Code</Label>
                  <Input
                    id="sellerPostalCode"
                    value={formState.trade.agreement.seller.address?.postal_zone || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.address.postal_zone", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerTaxId">Tax ID</Label>
                  <Input
                    id="sellerTaxId"
                    value={formState.trade.agreement.seller.tax_id || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.tax_id", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerIBAN">IBAN</Label>
                  <Input
                    id="sellerIBAN"
                    value={formState.trade.agreement.seller.iban || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.iban", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerPhone">Phone</Label>
                  <Input
                    id="sellerPhone"
                    value={formState.trade.agreement.seller.phone || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerEmail">Email</Label>
                  <Input
                    id="sellerEmail"
                    value={formState.trade.agreement.seller.email || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.email", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sellerHomepage">Homepage</Label>
                <Input
                  id="sellerHomepage"
                  value={formState.trade.agreement.seller.homepage || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.homepage", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerLegalForm">Legal Form</Label>
                  <Input
                    id="sellerLegalForm"
                    value={formState.trade.agreement.seller.legal_form || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.legal_form", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="sellerRegisterNumber">Register Number</Label>
                  <Input
                    id="sellerRegisterNumber"
                    value={formState.trade.agreement.seller.handels_register_number || ""}
                    onChange={(e) =>
                      handleInputChange("trade.agreement.seller.handels_register_number", e.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sellerRegisterName">Register Name</Label>
                <Input
                  id="sellerRegisterName"
                  value={formState.trade.agreement.seller.handels_register_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.handels_register_name", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Information Section */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerId">Buyer ID</Label>
                  <Input
                    id="buyerId"
                    value={formState.trade.agreement.buyer.id || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.id", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="buyerOrderNumber">Order Number</Label>
                  <Input
                    id="buyerOrderNumber"
                    value={formState.trade.agreement.buyer.order_number || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.order_number", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="buyerName">Name</Label>
                <Input
                  id="buyerName"
                  value={formState.trade.agreement.buyer.name}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerContactName">Contact Name</Label>
                <Input
                  id="buyerContactName"
                  value={formState.trade.agreement.buyer.contact_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.contact_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="buyerLegalForm">Legal Form</Label>
                <Input
                  id="buyerLegalForm"
                  value={formState.trade.agreement.buyer.legal_form || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.legal_form", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerCountry">Country</Label>
                  <Input
                    id="buyerCountry"
                    value={formState.trade.agreement.buyer.address?.country || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.address.country", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="buyerCountryCode">Country Code</Label>
                  <Input
                    id="buyerCountryCode"
                    value={formState.trade.agreement.buyer.address?.country_code || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.address.country_code", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="buyerStreet">Street</Label>
                <Input
                  id="buyerStreet"
                  value={formState.trade.agreement.buyer.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.street_name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerCity">City</Label>
                  <Input
                    id="buyerCity"
                    value={formState.trade.agreement.buyer.address?.city_name || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.address.city_name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="buyerPostalCode">Postal Code</Label>
                  <Input
                    id="buyerPostalCode"
                    value={formState.trade.agreement.buyer.address?.postal_zone || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.address.postal_zone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Information Section */}
        {formState.trade.agreement.orders && formState.trade.agreement.orders.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={formState.trade.agreement.orders[0].date || ""}
                    onChange={(e) => handleInputChange("trade.agreement.orders.0.date", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Information Section */}
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
              {/* Also update the payment type dropdown to use the same styling */}
              <div>
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={formState.trade.settlement.payment_means.type_code}
                  onValueChange={(value) => handleInputChange("trade.settlement.payment_means.type_code", value)}
                >
                  <SelectTrigger id="paymentType">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="58">58: SEPA Credit Transfer</SelectItem>
                    <SelectItem value="30">30: Credit Transfer</SelectItem>
                    <SelectItem value="42">42: Payment to Bank Account</SelectItem>
                    <SelectItem value="ZZZ">ZZZ: Other</SelectItem>
                  </SelectContent>
                </Select>
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
              {formState.trade.settlement.payee && (
                <div>
                  <Label htmlFor="payeeName">Payee Name</Label>
                  <Input
                    id="payeeName"
                    value={formState.trade.settlement.payee.name || ""}
                    onChange={(e) => handleInputChange("trade.settlement.payee.name", e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Line Items</h3>
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
                    <Label htmlFor={`item-${index}-tax-category`}>Tax Category</Label>
                    <Select
                      value={item.settlement_tax.category}
                      onValueChange={(value) =>
                        handleInputChange(`trade.items.${index}.settlement_tax.category`, value)
                      }
                    >
                      <SelectTrigger id={`item-${index}-tax-category`}>
                        <SelectValue placeholder="Select tax category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="AE">AE: VAT Reverse Charge</SelectItem>
                        <SelectItem value="E">E: Exempt from Tax</SelectItem>
                        <SelectItem value="S">S: Standard rate</SelectItem>
                        <SelectItem value="Z">Z: Zero rated goods</SelectItem>
                        <SelectItem value="H">H: Higher rate</SelectItem>
                        <SelectItem value="AA">AA: Lower rate</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor={`item-${index}-tax-amount`}>Tax Amount (€)</Label>
                    <Input
                      id={`item-${index}-tax-amount`}
                      type="number"
                      step="0.01"
                      value={item.settlement_tax.amount || 0}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-${index}-total`}>Total Price (€)</Label>
                    <Input id={`item-${index}-total`} type="number" step="0.01" value={item.total_amount} disabled />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-4 mb-6">
              <Button onClick={addItem} className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxTotal">Tax Amount (€)</Label>
                <Input id="taxTotal" value={formState.trade.settlement.monetary_summation.tax_total} disabled />
              </div>
              <div>
                <Label htmlFor="netTotal">Net Amount (€)</Label>
                <Input id="netTotal" value={formState.trade.settlement.monetary_summation.net_total} disabled />
              </div>
              <div>
                <Label htmlFor="grandTotal">Grand Total (€)</Label>
                <Input
                  id="grandTotal"
                  value={formState.trade.settlement.monetary_summation.grand_total}
                  disabled
                  className="font-bold"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

