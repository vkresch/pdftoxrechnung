"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, Trash2, ArrowUp, ArrowDown, Plus, HelpCircle } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface XRechnungFormProps {
  data: any
  onChange: (data: any) => void
}

export function XRechnungForm({ data, onChange }: XRechnungFormProps) {
  const [formState, setFormState] = useState(data)
  const { toast } = useToast()

  // Initialize form with default values if needed
  useEffect(() => {
    if (!formState.header) {
      const initializedData = initializeFormData(data)
      setFormState(initializedData)
    }
  }, [data])

  useEffect(() => {
    // Pass the updated form state to the parent component
    onChange(formState)
  }, [formState, onChange])

  // Initialize form data with default values
  const initializeFormData = (data: any) => {
    const currentDate = new Date().toISOString().split("T")[0]

    return {
      ...data,
      header: data.header || {
        id: "",
        name: "Rechnung",
        type_code: "380",
        issue_date_time: currentDate,
        languages: "de",
        notes: [],
      },
      context: data.context || {
        guideline_parameter: "urn:cen.eu:en16931:2017",
      },
      trade: data.trade || {
        agreement: {
          seller: {
            name: "",
            address: {
              street_name: "",
              city_name: "",
              postal_zone: "",
              country_code: "",
            },
            contact_name: "",
            contact_email: "",
            contact_phone: "",
          },
          buyer: {
            name: "",
            address: {
              street_name: "",
              city_name: "",
              postal_zone: "",
              country_code: "",
            },
          },
        },
        delivery: {
          date: "",
          recipient_name: "",
          location_id: "",
          address: {
            street_name: "",
            street_name2: "",
            additional_info: "",
            postal_zone: "",
            city_name: "",
            country_code: "",
            region: "",
          },
        },
        settlement: {
          currency_code: "EUR",
          payment_means: {
            type_code: "58",
          },
          monetary_summation: {
            net_total: 0,
            tax_total: 0,
            grand_total: 0,
          },
        },
        items: [],
        allowances: [],
        charges: [],
      },
    }
  }

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
        // Update all totals including tax calculations
        updateTotals(newState)
      }

      // If changing allowance or charge values, update totals
      if (path.includes("allowances") || path.includes("charges")) {
        updateTotals(newState)
      }

      return newState
    })
  }

  // Update the totals for the invoice
  const updateTotals = (state: any) => {
    // First calculate each line item's net amount (before tax)
    state.trade.items.forEach((item: any) => {
      // Calculate net amount for this line item (quantity * unit price)
      const netAmount = Number(item.quantity) * Number(item.agreement_net_price)
      item.delivery_details = Number.parseFloat(netAmount.toFixed(2))

      if (item.settlement_tax && item.settlement_tax.rate !== undefined) {
        // Calculate tax amount for this line item
        const taxRate = Number(item.settlement_tax.rate) / 100 // Convert percentage to decimal
        const taxAmount = netAmount * taxRate

        // Update the tax amount in the item
        item.settlement_tax.amount = Number.parseFloat(taxAmount.toFixed(2))

        // Update the total amount (net + tax)
        item.total_amount = Number.parseFloat((netAmount + taxAmount).toFixed(2))
      } else {
        // If no tax information, total equals net
        item.total_amount = item.delivery_details
      }
    })

    // Calculate items net total first (sum of all net amounts before tax)
    const itemsNetTotal = state.trade.items.reduce((sum: number, item: any) => sum + Number(item.delivery_details || 0), 0)
    
    // Update basis amount for all allowances and charges to the items net total
    if (state.trade.allowances && state.trade.allowances.length > 0) {
      state.trade.allowances.forEach((allowance: any) => {
        allowance.basis_amount = Number.parseFloat(itemsNetTotal.toFixed(2))
      })
    }
    
    if (state.trade.charges && state.trade.charges.length > 0) {
      state.trade.charges.forEach((charge: any) => {
        charge.basis_amount = Number.parseFloat(itemsNetTotal.toFixed(2))
      })
    }

    // Calculate allowances and charges
    let allowancesTotal = 0
    let chargesTotal = 0

    // Calculate allowances total
    if (state.trade.allowances && state.trade.allowances.length > 0) {
      state.trade.allowances.forEach((allowance: any) => {
        if (allowance.amount) {
          allowancesTotal += Number(allowance.amount)
        }
      })
    }

    // Calculate charges total
    if (state.trade.charges && state.trade.charges.length > 0) {
      state.trade.charges.forEach((charge: any) => {
        if (charge.amount) {
          chargesTotal += Number(charge.amount)
        }
      })
    }
    
    // Calculate the final net total (items - allowances + charges)
    const netTotal = itemsNetTotal - allowancesTotal + chargesTotal

    // Calculate tax total by summing up all individual tax amounts
    const taxTotal = state.trade.items.reduce(
      (sum: number, item: any) => sum + Number(item.settlement_tax?.amount || 0),
      0,
    )

    // Update monetary summation
    if (state.trade.settlement && state.trade.settlement.monetary_summation) {
      state.trade.settlement.monetary_summation.items_net_total = Number.parseFloat(itemsNetTotal.toFixed(2))
      state.trade.settlement.monetary_summation.allowances_net_total = Number.parseFloat(allowancesTotal.toFixed(2))
      state.trade.settlement.monetary_summation.charges_net_total = Number.parseFloat(chargesTotal.toFixed(2))
      state.trade.settlement.monetary_summation.net_total = Number.parseFloat(netTotal.toFixed(2))
      state.trade.settlement.monetary_summation.tax_total = Number.parseFloat(taxTotal.toFixed(2))

      // Calculate and update the grand total (including tax)
      state.trade.settlement.monetary_summation.grand_total = Number.parseFloat((netTotal + taxTotal).toFixed(2))
      
      // Calculate due amount (grand total - paid amount + rounding amount)
      const paidAmount = Number(state.trade.settlement.monetary_summation.paid_amount || 0)
      const roundingAmount = Number(state.trade.settlement.monetary_summation.rounding_amount || 0)
      state.trade.settlement.monetary_summation.due_amount = Number.parseFloat((netTotal + taxTotal - paidAmount + roundingAmount).toFixed(2))
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
          category: "S",
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

  // Move an item up in the list
  const moveItemUp = (index: number) => {
    if (index <= 0) return

    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      const items = newState.trade.items
      // Swap items
      [items[index], items[index - 1]] = [items[index - 1], items[index]]

      // Update line_ids
      items.forEach((item: any, idx: number) => {
        item.line_id = (idx + 1).toString()
      })

      return newState
    })
  }

  // Move an item down in the list
  const moveItemDown = (index: number) => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      const items = newState.trade.items

      if (index >= items.length - 1) return newState

      // Swap items
      [items[index], items[index + 1]] = [items[index + 1], items[index]]

      // Update line_ids
      items.forEach((item: any, idx: number) => {
        item.line_id = (idx + 1).toString()
      })

      return newState
    })
  }

  // Add a new allowance
  const addAllowance = () => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      
      if (!newState.trade.allowances) {
        newState.trade.allowances = []
      }
      
      // Get the current items net total for the basis amount
      const itemsNetTotal = newState.trade.settlement.monetary_summation?.items_net_total || 0
      
      newState.trade.allowances.push({
        type: "Allowance",
        amount: 0,
        basis_amount: itemsNetTotal,
        percent: 0,
        tax_category: "S",
        tax_rate: 19,
        reason: "",
      })

      updateTotals(newState)
      return newState
    })
  }

  // Remove an allowance
  const removeAllowance = (index: number) => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      newState.trade.allowances.splice(index, 1)
      updateTotals(newState)
      return newState
    })
  }

  // Add a new charge
  const addCharge = () => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      
      if (!newState.trade.charges) {
        newState.trade.charges = []
      }
      
      // Get the current items net total for the basis amount
      const itemsNetTotal = newState.trade.settlement.monetary_summation?.items_net_total || 0
      
      newState.trade.charges.push({
        type: "Charge",
        amount: 0,
        basis_amount: itemsNetTotal,
        percent: 0,
        tax_category: "S",
        tax_rate: 19,
        reason: "",
      })

      updateTotals(newState)
      return newState
    })
  }

  // Remove a charge
  const removeCharge = (index: number) => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      newState.trade.charges.splice(index, 1)
      updateTotals(newState)
      return newState
    })
  }

  // Add a document reference
  const addDocumentReference = () => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      if (!newState.document_references) {
        newState.document_references = []
      }
      newState.document_references.push("")
      return newState
    })
  }

  // Remove a document reference
  const removeDocumentReference = (index: number) => {
    setFormState((prevState: any) => {
      const newState = JSON.parse(JSON.stringify(prevState))
      newState.document_references.splice(index, 1)
      return newState
    })
  }

  // Calculate due date based on issue date and days
  const calculateDueDate = (days: number) => {
    if (!formState.header.issue_date_time) return ""

    const issueDate = new Date(formState.header.issue_date_time)
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + days)

    return dueDate.toISOString().split("T")[0]
  }

  // Handle due date days change
  const handleDueDateDaysChange = (days: number) => {
    const dueDate = calculateDueDate(days)
    handleInputChange("trade.settlement.advance_payment_date", dueDate)
  }

  // Check if the data has the expected structure
  if (!formState || !formState.header || !formState.trade) {
    return <div>Invalid data format</div>
  }

  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <div className="space-y-6 pr-4">
        {/* Invoice General Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">📄</span>
              Rechnungsdaten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-title">Rechnungstitel</Label>
                <Input
                  id="invoice-title"
                  value={formState.header.name}
                  onChange={(e) => handleInputChange("header.name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-number" className="flex items-center">
                  Rechnungsnummer
                  <span className="text-xs text-muted-foreground ml-1">(BT-1)</span>
                </Label>
                <Input
                  id="invoice-number"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Rechnungsnummer"
                  value={formState.header.id}
                  onChange={(e) => handleInputChange("header.id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-issue-date" className="flex items-center">
                  Rechnungsdatum
                  <span className="text-xs text-muted-foreground ml-1">(BT-2)</span>
                </Label>
                <Input
                  id="invoice-issue-date"
                  type="date"
                  className="bg-[var(--required-field-bg-color)]"
                  value={formState.header.issue_date_time}
                  onChange={(e) => handleInputChange("header.issue_date_time", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-type-code" className="flex items-center">
                  Rechnungtyp
                  <span className="text-xs text-muted-foreground ml-1">(BT-3)</span>
                </Label>
                <Select
                  value={formState.header.type_code}
                  onValueChange={(value) => handleInputChange("header.type_code", value)}
                >
                  <SelectTrigger id="invoice-type-code">
                    <SelectValue placeholder="Rechnungtyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="325">325 - Proformarechnung</SelectItem>
                    <SelectItem value="326">326 - Teilrechnung</SelectItem>
                    <SelectItem value="380">380 - Rechnung</SelectItem>
                    <SelectItem value="381">381 - Gutschriftanzeige</SelectItem>
                    <SelectItem value="383">383 - Belastungsanzeige</SelectItem>
                    <SelectItem value="384">384 - Rechnungskorrektur</SelectItem>
                    <SelectItem value="386">386 - Vorauszahlungsrechnung</SelectItem>
                    <SelectItem value="387">387 - Mietrechnung</SelectItem>
                    <SelectItem value="388">388 - Steuerrechnung</SelectItem>
                    <SelectItem value="389">389 - Selbstfakturierte Rechnung</SelectItem>
                    <SelectItem value="393">393 - Inkasso-Rechnung</SelectItem>
                    <SelectItem value="394">394 - Leasing-Rechnung</SelectItem>
                    <SelectItem value="575">575 - Rechnung des Versicherers</SelectItem>
                    <SelectItem value="623">623 - Speditionsrechnung</SelectItem>
                    <SelectItem value="780">780 - Frachtrechnung</SelectItem>
                    <SelectItem value="875">875 - Teilrechnung für Bauleistungen</SelectItem>
                    <SelectItem value="876">876 - Teilschlussrechnung für Bauleistungen</SelectItem>
                    <SelectItem value="877">877 - Schlussrechnung für Bauleistungen</SelectItem>
                    <SelectItem value="935">935 - Zollrechnung</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice-currency" className="flex items-center">
                  Währung
                  <span className="text-xs text-muted-foreground ml-1">(BT-5)</span>
                </Label>
                <Select
                  value={formState.trade.settlement.currency_code}
                  onValueChange={(value) => handleInputChange("trade.settlement.currency_code", value)}
                >
                  <SelectTrigger id="invoice-currency">
                    <SelectValue placeholder="Währung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice-due-date" className="flex items-center">
                  Fälligkeitsdatum
                  <span className="text-xs text-muted-foreground ml-1">(BT-9)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invoice-due-date"
                    type="date"
                    value={formState.trade.settlement.advance_payment_date || ""}
                    onChange={(e) => handleInputChange("trade.settlement.advance_payment_date", e.target.value)}
                    className="flex-grow"
                  />
                  <Input
                    id="invoice-due-date-days"
                    type="number"
                    className="w-20 text-center"
                    placeholder="Tage"
                    aria-label="Anzahl Tage, bis die Zahlung fällig wird"
                    onChange={(e) => handleDueDateDaysChange(Number.parseInt(e.target.value) || 0)}
                  />
                  <span className="flex items-center px-3 border rounded-md bg-muted">Tage</span>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-delivery-date" className="flex items-center">
                  Leistungs-/Lieferdatum
                  <span className="text-xs text-muted-foreground ml-1">(BT-72)</span>
                </Label>
                <Input
                  id="invoice-delivery-date"
                  type="date"
                  value={formState.trade.delivery?.date || ""}
                  onChange={(e) => handleInputChange("trade.delivery.date", e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label className="flex items-center">
                  Leistungs-/Abrechnungszeitraum
                  <span className="text-xs text-muted-foreground ml-1">(BT-73, BT-74)</span>
                </Label>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <Input
                    id="invoice-billing-period-start-date"
                    type="date"
                    value={formState.trade.billing_period?.start_date || ""}
                    onChange={(e) => handleInputChange("trade.billing_period.start_date", e.target.value)}
                    className="flex-grow"
                  />
                  <span className="px-3">bis</span>
                  <Input
                    id="invoice-billing-period-end-date"
                    type="date"
                    value={formState.trade.billing_period?.end_date || ""}
                    onChange={(e) => handleInputChange("trade.billing_period.end_date", e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-buyer-reference" className="flex items-center">
                  Käuferreferenz
                  <span className="text-xs text-muted-foreground ml-1">(BT-10)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center ml-1">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Pflichtangabe bei Rechnungen für Behörden, optional bei Rechnungen für Firmen</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 border px-2 rounded-md">
                    <input
                      id="invoice-buyer-reference-disabled"
                      type="checkbox"
                      className="form-checkbox h-4 w-4"
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange("trade.agreement.buyer.reference", "")
                        }
                      }}
                    />
                    <span className="text-sm">Deaktivieren</span>
                  </div>
                  <Input
                    id="invoice-buyer-reference"
                    className="bg-[var(--maybe-required-field-bg-color)] flex-grow"
                    placeholder="Käuferreferenz (Leitweg-ID, ...)"
                    value={formState.trade.agreement.buyer.reference || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.reference", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-project-reference" className="flex items-center">
                  Projektnummer
                  <span className="text-xs text-muted-foreground ml-1">(BT-11)</span>
                </Label>
                <Input
                  id="invoice-project-reference"
                  placeholder="Projektnummer"
                  value={formState.trade.agreement.project_reference || ""}
                  onChange={(e) => handleInputChange("trade.agreement.project_reference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-contract-reference" className="flex items-center">
                  Vertragsnummer
                  <span className="text-xs text-muted-foreground ml-1">(BT-12)</span>
                </Label>
                <Input
                  id="invoice-contract-reference"
                  placeholder="Vertragsnummer"
                  value={formState.trade.agreement.contract_reference || ""}
                  onChange={(e) => handleInputChange("trade.agreement.contract_reference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-purchase-order-reference" className="flex items-center">
                  Bestellnummer
                  <span className="text-xs text-muted-foreground ml-1">(BT-13)</span>
                </Label>
                <Input
                  id="invoice-purchase-order-reference"
                  placeholder="Bestellnummer"
                  value={formState.trade.agreement.purchase_order_reference || ""}
                  onChange={(e) => handleInputChange("trade.agreement.purchase_order_reference", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-sales-order-reference" className="flex items-center">
                  Auftragsnummer
                  <span className="text-xs text-muted-foreground ml-1">(BT-14)</span>
                </Label>
                <Input
                  id="invoice-sales-order-reference"
                  placeholder="Auftragsnummer"
                  value={formState.trade.agreement.sales_order_reference || ""}
                  onChange={(e) => handleInputChange("trade.agreement.sales_order_reference", e.target.value)}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label className="flex items-center">
                  Dokumentreferenz
                  <span className="text-xs text-muted-foreground ml-1">(BT-17)</span>
                </Label>
                <div id="invoice-document-references">
                  {formState.document_references?.map((ref: string, index: number) => (
                    <div key={index} className="flex gap-2 mt-1">
                      <Input
                        type="text"
                        placeholder="Referenz auf eine Ausschreibung, ein Los oder ähnliches"
                        value={ref}
                        onChange={(e) => {
                          const newRefs = [...formState.document_references]
                          newRefs[index] = e.target.value
                          handleInputChange("document_references", newRefs)
                        }}
                        className="flex-grow"
                      />
                      <Button variant="outline" size="icon" onClick={() => removeDocumentReference(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {index === formState.document_references.length - 1 && (
                        <Button variant="outline" size="icon" onClick={addDocumentReference}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {(!formState.document_references || formState.document_references.length === 0) && (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="text"
                        placeholder="Referenz auf eine Ausschreibung, ein Los oder ähnliches"
                        className="flex-grow"
                      />
                      <Button variant="outline" size="icon" onClick={addDocumentReference}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="invoice-note" className="flex items-center">
                  Bemerkungen
                  <span className="text-xs text-muted-foreground ml-1">(BT-22)</span>
                </Label>
                <Textarea
                  id="invoice-note"
                  rows={2}
                  placeholder="Zusätzliche Hinweise und Bemerkungen"
                  value={formState.header.notes ? formState.header.notes.join("\n") : ""}
                  onChange={(e) => handleInputChange("header.notes", e.target.value.split("\n"))}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="invoice-intro-text">Einleitungstext</Label>
                <Textarea
                  id="invoice-intro-text"
                  rows={3}
                  value={formState.intro_text || ""}
                  onChange={(e) => handleInputChange("intro_text", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">🏢</span>
              Rechnungssteller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-seller-name" className="flex items-center">
                  Unternehmen<span className="text-xs text-muted-foreground ml-1">(BT-27)</span>
                </Label>
                <Input
                  id="invoice-seller-name"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Name"
                  value={formState.trade.agreement.seller.name}
                  onChange={(e) => handleInputChange("trade.agreement.seller.name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-trade-name" className="flex items-center">
                  Handelsname<span className="text-xs text-muted-foreground ml-1">(BT-28)</span>
                </Label>
                <Input
                  id="invoice-seller-trade-name"
                  placeholder="Handelsname"
                  value={formState.trade.agreement.seller.trade_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.trade_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-id" className="flex items-center">
                  Verkäuferkennung<span className="text-xs text-muted-foreground ml-1">(BT-29)</span>
                </Label>
                <Input
                  id="invoice-seller-id"
                  className="bg-[var(--maybe-required-field-bg-color)]"
                  placeholder="Verkäuferkennung"
                  value={formState.trade.agreement.seller.id || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-trade-id" className="flex items-center">
                  Registernummer<span className="text-xs text-muted-foreground ml-1">(BT-30)</span>
                </Label>
                <Input
                  id="invoice-seller-trade-id"
                  className="bg-[var(--maybe-required-field-bg-color)]"
                  placeholder="Registernummer"
                  value={formState.trade.agreement.seller.trade_id || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.trade_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-vat-id" className="flex items-center">
                  Umsatzsteuer-ID<span className="text-xs text-muted-foreground ml-1">(BT-31)</span>
                </Label>
                <Input
                  id="invoice-seller-vat-id"
                  className="bg-[var(--maybe-required-field-bg-color)]"
                  placeholder="DE123456789"
                  value={formState.trade.agreement.seller.vat_id || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.vat_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-tax-id" className="flex items-center">
                  Steuernummer<span className="text-xs text-muted-foreground ml-1">(BT-32)</span>
                </Label>
                <Input
                  id="invoice-seller-tax-id"
                  placeholder="Steuernummer"
                  value={formState.trade.agreement.seller.tax_id || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.tax_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-legal-info" className="flex items-center">
                  Rechtliche Informationen<span className="text-xs text-muted-foreground ml-1">(BT-33)</span>
                </Label>
                <Textarea
                  id="invoice-seller-legal-info"
                  rows={2}
                  placeholder="z.B. Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß §19 UStG."
                  value={formState.trade.agreement.seller.legal_info || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.legal_info", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-electronic-address" className="flex items-center">
                  Elektronische Adresse<span className="text-xs text-muted-foreground ml-1">(BT-34)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invoice-seller-electronic-address"
                    className="bg-[var(--required-field-bg-color)] flex-grow"
                    value={formState.trade.agreement.seller.electronic_address || ""}
                    onChange={(e) => handleInputChange("trade.agreement.seller.electronic_address", e.target.value)}
                  />
                  <Select
                    value={formState.trade.agreement.seller.electronic_address_type_code || "EM"}
                    onValueChange={(value) =>
                      handleInputChange("trade.agreement.seller.electronic_address_type_code", value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EM">EM - Email</SelectItem>
                      <SelectItem value="0088">0088 - EAN Location Code</SelectItem>
                      <SelectItem value="0192">0192 - Enhetsregisteret</SelectItem>
                      <SelectItem value="0204">0204 - Leitweg-ID</SelectItem>
                      <SelectItem value="9930">9930 - Germany VAT number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Anschrift</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-seller-address-line1" className="flex items-center">
                  Straße 1<span className="text-xs text-muted-foreground ml-1">(BT-35)</span>
                </Label>
                <Input
                  id="invoice-seller-address-line1"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Straße 1"
                  value={formState.trade.agreement.seller.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.street_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-address-line2" className="flex items-center">
                  Straße 2<span className="text-xs text-muted-foreground ml-1">(BT-36)</span>
                </Label>
                <Input
                  id="invoice-seller-address-line2"
                  placeholder="Straße 2"
                  value={formState.trade.agreement.seller.address?.street_name2 || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.street_name2", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-address-post-code" className="flex items-center">
                  PLZ
                  <span className="text-xs text-muted-foreground ml-1">(BT-38)</span>
                </Label>
                <Input
                  id="invoice-seller-address-post-code"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="12345"
                  value={formState.trade.agreement.seller.address?.postal_zone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.postal_zone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-address-city" className="flex items-center">
                  Ort
                  <span className="text-xs text-muted-foreground ml-1">(BT-37)</span>
                </Label>
                <Input
                  id="invoice-seller-address-city"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Ort"
                  value={formState.trade.agreement.seller.address?.city_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.address.city_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-address-country-code" className="flex items-center">
                  Land
                  <span className="text-xs text-muted-foreground ml-1">(BT-40)</span>
                </Label>
                <Select
                  value={formState.trade.agreement.seller.address?.country_code || ""}
                  onValueChange={(value) => handleInputChange("trade.agreement.seller.address.country_code", value)}
                >
                  <SelectTrigger
                    id="invoice-seller-address-country-code"
                    className="bg-[var(--required-field-bg-color)]"
                  >
                    <SelectValue placeholder="Land auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">DE - Germany</SelectItem>
                    <SelectItem value="AT">AT - Austria</SelectItem>
                    <SelectItem value="CH">CH - Switzerland</SelectItem>
                    <SelectItem value="FR">FR - France</SelectItem>
                    <SelectItem value="IT">IT - Italy</SelectItem>
                    <SelectItem value="ES">ES - Spain</SelectItem>
                    <SelectItem value="GB">GB - United Kingdom</SelectItem>
                    <SelectItem value="US">US - United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-seller-contact-name" className="flex items-center">
                  Name
                  <span className="text-xs text-muted-foreground ml-1">(BT-41)</span>
                </Label>
                <Input
                  id="invoice-seller-contact-name"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Name"
                  value={formState.trade.agreement.seller.contact_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.contact_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-contact-email" className="flex items-center">
                  E-Mail
                  <span className="text-xs text-muted-foreground ml-1">(BT-43)</span>
                </Label>
                <Input
                  id="invoice-seller-contact-email"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="max.mustermann@beispiel.de"
                  value={formState.trade.agreement.seller.contact_email || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.contact_email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-seller-contact-phone" className="flex items-center">
                  Telefon
                  <span className="text-xs text-muted-foreground ml-1">(BT-42)</span>
                </Label>
                <Input
                  id="invoice-seller-contact-phone"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="+49 30 1234567"
                  value={formState.trade.agreement.seller.contact_phone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.seller.contact_phone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">👤</span>
              Rechnungsempfänger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-buyer-name" className="flex items-center">
                  Unternehmen<span className="text-xs text-muted-foreground ml-1">(BT-44)</span>
                </Label>
                <Input
                  id="invoice-buyer-name"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Name"
                  value={formState.trade.agreement.buyer.name}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-trade-name" className="flex items-center">
                  Handelsname<span className="text-xs text-muted-foreground ml-1">(BT-45)</span>
                </Label>
                <Input
                  id="invoice-buyer-trade-name"
                  placeholder="Handelsname"
                  value={formState.trade.agreement.buyer.trade_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.trade_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-id" className="flex items-center">
                  Käuferkennung<span className="text-xs text-muted-foreground ml-1">(BT-46)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invoice-buyer-id"
                    placeholder="Käuferkennung (Kundennummer, ...)"
                    value={formState.trade.agreement.buyer.id || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.id", e.target.value)}
                    className="flex-grow"
                  />
                  <Select
                    value={formState.trade.agreement.buyer.id_type || "id"}
                    onValueChange={(value) => handleInputChange("trade.agreement.buyer.id_type", value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">ID</SelectItem>
                      <SelectItem value="customerId">Kundennummer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-buyer-vat-id" className="flex items-center">
                  Umsatzsteuer-ID<span className="text-xs text-muted-foreground ml-1">(BT-48)</span>
                </Label>
                <Input
                  id="invoice-buyer-vat-id"
                  placeholder="DE123456789"
                  value={formState.trade.agreement.buyer.vat_id || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.vat_id", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-electronic-address" className="flex items-center">
                  Elektronische Adresse<span className="text-xs text-muted-foreground ml-1">(BT-49)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="invoice-buyer-electronic-address"
                    className="bg-[var(--required-field-bg-color)] flex-grow"
                    value={formState.trade.agreement.buyer.electronic_address || ""}
                    onChange={(e) => handleInputChange("trade.agreement.buyer.electronic_address", e.target.value)}
                  />
                  <Select
                    value={formState.trade.agreement.buyer.electronic_address_type_code || "EM"}
                    onValueChange={(value) =>
                      handleInputChange("trade.agreement.buyer.electronic_address_type_code", value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EM">EM - Email</SelectItem>
                      <SelectItem value="0088">0088 - EAN Location Code</SelectItem>
                      <SelectItem value="0192">0192 - Enhetsregisteret</SelectItem>
                      <SelectItem value="0204">0204 - Leitweg-ID</SelectItem>
                      <SelectItem value="9930">9930 - Germany VAT number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Anschrift</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-buyer-address-line1" className="flex items-center">
                  Straße 1<span className="text-xs text-muted-foreground ml-1">(BT-50)</span>
                </Label>
                <Input
                  id="invoice-buyer-address-line1"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Straße 1"
                  value={formState.trade.agreement.buyer.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.street_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-address-line2" className="flex items-center">
                  Straße 2<span className="text-xs text-muted-foreground ml-1">(BT-51)</span>
                </Label>
                <Input
                  id="invoice-buyer-address-line2"
                  placeholder="Straße 2"
                  value={formState.trade.agreement.buyer.address?.street_name2 || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.street_name2", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-address-post-code" className="flex items-center">
                  PLZ
                  <span className="text-xs text-muted-foreground ml-1">(BT-53)</span>
                </Label>
                <Input
                  id="invoice-buyer-address-post-code"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="12345"
                  value={formState.trade.agreement.buyer.address?.postal_zone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.postal_zone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-address-city" className="flex items-center">
                  Ort
                  <span className="text-xs text-muted-foreground ml-1">(BT-52)</span>
                </Label>
                <Input
                  id="invoice-buyer-address-city"
                  className="bg-[var(--required-field-bg-color)]"
                  placeholder="Ort"
                  value={formState.trade.agreement.buyer.address?.city_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.address.city_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-address-country-code" className="flex items-center">
                  Land
                  <span className="text-xs text-muted-foreground ml-1">(BT-55)</span>
                </Label>
                <Select
                  value={formState.trade.agreement.buyer.address?.country_code || ""}
                  onValueChange={(value) => handleInputChange("trade.agreement.buyer.address.country_code", value)}
                >
                  <SelectTrigger
                    id="invoice-buyer-address-country-code"
                    className="bg-[var(--required-field-bg-color)]"
                  >
                    <SelectValue placeholder="Land auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">DE - Germany</SelectItem>
                    <SelectItem value="AT">AT - Austria</SelectItem>
                    <SelectItem value="CH">CH - Switzerland</SelectItem>
                    <SelectItem value="FR">FR - France</SelectItem>
                    <SelectItem value="IT">IT - Italy</SelectItem>
                    <SelectItem value="ES">ES - Spain</SelectItem>
                    <SelectItem value="GB">GB - United Kingdom</SelectItem>
                    <SelectItem value="US">US - United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-buyer-contact-name" className="flex items-center">
                  Name
                  <span className="text-xs text-muted-foreground ml-1">(BT-56)</span>
                </Label>
                <Input
                  id="invoice-buyer-contact-name"
                  placeholder="Name"
                  value={formState.trade.agreement.buyer.contact_name || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.contact_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-contact-email" className="flex items-center">
                  E-Mail
                  <span className="text-xs text-muted-foreground ml-1">(BT-58)</span>
                </Label>
                <Input
                  id="invoice-buyer-contact-email"
                  placeholder="max.mustermann@beispiel.de"
                  value={formState.trade.agreement.buyer.contact_email || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.contact_email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-buyer-contact-phone" className="flex items-center">
                  Telefon
                  <span className="text-xs text-muted-foreground ml-1">(BT-57)</span>
                </Label>
                <Input
                  id="invoice-buyer-contact-phone"
                  placeholder="+49 30 1234567"
                  value={formState.trade.agreement.buyer.contact_phone || ""}
                  onChange={(e) => handleInputChange("trade.agreement.buyer.contact_phone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">💰</span>
              Zahlungsdetails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-payment-method-type-code" className="flex items-center">
                      Zahlungsart
                      <span className="text-xs text-muted-foreground ml-1">(BT-81)</span>
                    </Label>
                    <Select
                      value={formState.trade.settlement.payment_means?.type_code || "58"}
                      onValueChange={(value) => handleInputChange("trade.settlement.payment_means.type_code", value)}
                    >
                      <SelectTrigger
                        id="invoice-payment-method-type-code"
                        className="bg-[var(--required-field-bg-color)]"
                      >
                        <SelectValue placeholder="Zahlungsart" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Nicht definiert</SelectItem>
                        <SelectItem value="30">30 - Überweisung</SelectItem>
                        <SelectItem value="42">42 - Zahlung auf Bankkonto</SelectItem>
                        <SelectItem value="58">58 - SEPA-Überweisung</SelectItem>
                        <SelectItem value="59">59 - SEPA-Lastschrift</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="invoice-payment-method-account-name" className="flex items-center">
                      Kontoinhaber
                      <span className="text-xs text-muted-foreground ml-1">(BT-85)</span>
                    </Label>
                    <Input
                      id="invoice-payment-method-account-name"
                      className="bg-[var(--required-field-bg-color)]"
                      placeholder="Name"
                      value={formState.trade.settlement.payment_means?.account_name || ""}
                      onChange={(e) => handleInputChange("trade.settlement.payment_means.account_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoice-payment-method-iban" className="flex items-center">
                      IBAN
                      <span className="text-xs text-muted-foreground ml-1">(BT-84)</span>
                    </Label>
                    <Input
                      id="invoice-payment-method-iban"
                      className="bg-[var(--required-field-bg-color)]"
                      placeholder="DE12345678901234567890"
                      value={formState.trade.settlement.payment_means?.iban || ""}
                      onChange={(e) => handleInputChange("trade.settlement.payment_means.iban", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoice-payment-method-bic" className="flex items-center">
                      BIC
                      <span className="text-xs text-muted-foreground ml-1">(BT-86)</span>
                    </Label>
                    <Input
                      id="invoice-payment-method-bic"
                      placeholder="ABCDEFGHIJK"
                      value={formState.trade.settlement.payment_means?.bic || ""}
                      onChange={(e) => handleInputChange("trade.settlement.payment_means.bic", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoice-payment-method-bank-name">Name der Bank</Label>
                    <Input
                      id="invoice-payment-method-bank-name"
                      placeholder="Name der Bank"
                      value={formState.trade.settlement.payment_means?.bank_name || ""}
                      onChange={(e) => handleInputChange("trade.settlement.payment_means.bank_name", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="invoice-payment-reference" className="flex items-center">
                    Verwendungszweck
                    <span className="text-xs text-muted-foreground ml-1">(BT-83)</span>
                  </Label>
                  <Input
                    id="invoice-payment-reference"
                    placeholder="Verwendungszweck"
                    value={formState.trade.settlement.payment_reference || ""}
                    onChange={(e) => handleInputChange("trade.settlement.payment_reference", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="invoice-payment-terms" className="flex items-center">
                    Zahlungsbedingungen
                    <span className="text-xs text-muted-foreground ml-1">(BT-20)</span>
                  </Label>
                  <Textarea
                    id="invoice-payment-terms"
                    rows={3}
                    placeholder="Zahlungsziel: 10 Tage nach Zugang der Rechnung"
                    value={formState.trade.settlement.payment_terms || ""}
                    onChange={(e) => handleInputChange("trade.settlement.payment_terms", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">🚚</span>
              Lieferdetails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-delivery-recipient-name" className="flex items-center">
                  Name des Empfängers<span className="text-xs text-muted-foreground ml-1">(BT-70)</span>
                </Label>
                <Input
                  id="invoice-delivery-recipient-name"
                  placeholder="Name des Empfängers"
                  value={formState.trade.delivery?.recipient_name || ""}
                  onChange={(e) => handleInputChange("trade.delivery.recipient_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invoice-delivery-location-id" className="flex items-center">
                  Kennung des Lieferorts<span className="text-xs text-muted-foreground ml-1">(BT-71)</span>
                </Label>
                <Input
                  id="invoice-delivery-location-id"
                  placeholder="Kennung des Lieferorts"
                  value={formState.trade.delivery?.location_id || ""}
                  onChange={(e) => handleInputChange("trade.delivery.location_id", e.target.value)}
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">Lieferadresse</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-delivery-address-line1" className="flex items-center">
                  Straße 1<span className="text-xs text-muted-foreground ml-1">(BT-75)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-line1"
                  placeholder="Straße 1"
                  value={formState.trade.delivery?.address?.street_name || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.street_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-line2" className="flex items-center">
                  Straße 2<span className="text-xs text-muted-foreground ml-1">(BT-76)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-line2"
                  placeholder="Straße 2"
                  value={formState.trade.delivery?.address?.street_name2 || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.street_name2", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-line3" className="flex items-center">
                  Zusatz<span className="text-xs text-muted-foreground ml-1">(BT-165)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-line3"
                  placeholder="Zusatz"
                  value={formState.trade.delivery?.address?.additional_info || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.additional_info", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-post-code" className="flex items-center">
                  PLZ<span className="text-xs text-muted-foreground ml-1">(BT-78)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-post-code"
                  placeholder="12345"
                  value={formState.trade.delivery?.address?.postal_zone || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.postal_zone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-city" className="flex items-center">
                  Ort<span className="text-xs text-muted-foreground ml-1">(BT-77)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-city"
                  placeholder="Ort"
                  value={formState.trade.delivery?.address?.city_name || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.city_name", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-country-code" className="flex items-center">
                  Land<span className="text-xs text-muted-foreground ml-1">(BT-80)</span>
                </Label>
                <Select
                  value={formState.trade.delivery?.address?.country_code || ""}
                  onValueChange={(value) => handleInputChange("trade.delivery.address.country_code", value)}
                >
                  <SelectTrigger id="invoice-delivery-address-country-code">
                    <SelectValue placeholder="Land auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">DE - Germany</SelectItem>
                    <SelectItem value="AT">AT - Austria</SelectItem>
                    <SelectItem value="CH">CH - Switzerland</SelectItem>
                    <SelectItem value="FR">FR - France</SelectItem>
                    <SelectItem value="IT">IT - Italy</SelectItem>
                    <SelectItem value="ES">ES - Spain</SelectItem>
                    <SelectItem value="GB">GB - United Kingdom</SelectItem>
                    <SelectItem value="US">US - United States</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice-delivery-address-region" className="flex items-center">
                  Region<span className="text-xs text-muted-foreground ml-1">(BT-79)</span>
                </Label>
                <Input
                  id="invoice-delivery-address-region"
                  placeholder="Region / Bundesland"
                  value={formState.trade.delivery?.address?.region || ""}
                  onChange={(e) => handleInputChange("trade.delivery.address.region", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">📋</span>
              Positionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="invoice-items" className="space-y-6">
              {formState.trade.items.map((item: any, index: number) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`invoice-item-lineId-${index}`} className="text-sm m-0">
                        Position
                        <span className="text-xs text-muted-foreground ml-1">(BT-126)</span>
                      </Label>
                      <Input
                        id={`invoice-item-lineId-${index}`}
                        className="w-20 p-1"
                        value={item.line_id}
                        readOnly
                        disabled
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => moveItemUp(index)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveItemDown(index)}
                        disabled={index === formState.trade.items.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor={`invoice-item-name-${index}`} className="flex items-center">
                        Name
                        <span className="text-xs text-muted-foreground ml-1">(BT-153)</span>
                      </Label>
                      <Input
                        id={`invoice-item-name-${index}`}
                        className="bg-[var(--required-field-bg-color)]"
                        placeholder="Name"
                        value={item.product_name}
                        onChange={(e) => handleInputChange(`trade.items.${index}.product_name`, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-id-${index}`} className="flex items-center">
                        Artikel-Nr.
                        <span className="text-xs text-muted-foreground ml-1">(BT-155)</span>
                      </Label>
                      <Input
                        id={`invoice-item-id-${index}`}
                        placeholder="Artikel-Nr."
                        value={item.id || ""}
                        onChange={(e) => handleInputChange(`trade.items.${index}.id`, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-order-position-${index}`} className="flex items-center">
                        Auftragsposition
                        <span className="text-xs text-muted-foreground ml-1">(BT-132)</span>
                      </Label>
                      <Input
                        id={`invoice-item-order-position-${index}`}
                        placeholder="Auftragsposition"
                        value={item.order_position || ""}
                        onChange={(e) => handleInputChange(`trade.items.${index}.order_position`, e.target.value)}
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <Label htmlFor={`invoice-item-description-${index}`} className="flex items-center">
                        Beschreibung
                        <span className="text-xs text-muted-foreground ml-1">(BT-154)</span>
                      </Label>
                      <Textarea
                        id={`invoice-item-description-${index}`}
                        rows={2}
                        placeholder="Beschreibung"
                        value={item.description || ""}
                        onChange={(e) => handleInputChange(`trade.items.${index}.description`, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-quantity-${index}`} className="flex items-center">
                        Menge
                        <span className="text-xs text-muted-foreground ml-1">(BT-129)</span>
                      </Label>
                      <Input
                        id={`invoice-item-quantity-${index}`}
                        type="number"
                        step="any"
                        className="bg-[var(--required-field-bg-color)]"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(`trade.items.${index}.quantity`, Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-quantity-unit-${index}`} className="flex items-center">
                        Einheit
                        <span className="text-xs text-muted-foreground ml-1">(BT-130)</span>
                      </Label>
                      <Select
                        value={item.quantity_unit || "H87"}
                        onValueChange={(value) => handleInputChange(`trade.items.${index}.quantity_unit`, value)}
                      >
                        <SelectTrigger
                          id={`invoice-item-quantity-unit-${index}`}
                          className="bg-[var(--required-field-bg-color)]"
                        >
                          <SelectValue placeholder="Einheit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="H87">H87 - Stück</SelectItem>
                          <SelectItem value="C62">C62 - Eins</SelectItem>
                          <SelectItem value="LS">LS - Pauschale</SelectItem>
                          <SelectItem value="P1">P1 - Prozent</SelectItem>
                          <SelectItem value="MIN">MIN - Minute</SelectItem>
                          <SelectItem value="HUR">HUR - Stunde</SelectItem>
                          <SelectItem value="DAY">DAY - Tag</SelectItem>
                          <SelectItem value="WEE">WEE - Woche</SelectItem>
                          <SelectItem value="MON">MON - Monat</SelectItem>
                          <SelectItem value="KGM">KGM - Kilogramm</SelectItem>
                          <SelectItem value="MTR">MTR - Meter</SelectItem>
                          <SelectItem value="MTK">MTK - Quadratmeter</SelectItem>
                          <SelectItem value="LTR">LTR - Liter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-net-unit-price-${index}`} className="flex items-center">
                        Einzelpreis (Netto)
                        <span className="text-xs text-muted-foreground ml-1">(BT-146)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-item-net-unit-price-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={item.agreement_net_price}
                          onChange={(e) =>
                            handleInputChange(`trade.items.${index}.agreement_net_price`, Number(e.target.value))
                          }
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-vat-rate-${index}`} className="flex items-center">
                        Steuersatz
                        <span className="text-xs text-muted-foreground ml-1">(BT-152)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-item-vat-rate-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={item.settlement_tax?.rate || 19}
                          onChange={(e) =>
                            handleInputChange(`trade.items.${index}.settlement_tax.rate`, Number(e.target.value))
                          }
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">%</div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-vat-code-${index}`} className="flex items-center">
                        Steuerkategorie
                        <span className="text-xs text-muted-foreground ml-1">(BT-151)</span>
                      </Label>
                      <Select
                        value={item.settlement_tax?.category || "S"}
                        onValueChange={(value) =>
                          handleInputChange(`trade.items.${index}.settlement_tax.category`, value)
                        }
                      >
                        <SelectTrigger
                          id={`invoice-item-vat-code-${index}`}
                          className="bg-[var(--required-field-bg-color)]"
                        >
                          <SelectValue placeholder="Steuerkategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S - Standard Rate</SelectItem>
                          <SelectItem value="Z">Z - Nach dem Nullsatz zu versteuernde Waren</SelectItem>
                          <SelectItem value="E">E - Steuerbefreit</SelectItem>
                          <SelectItem value="AE">AE - Umkehrung der Steuerschuldnerschaft</SelectItem>
                          <SelectItem value="K">
                            K - Umsatzsteuerbefreit für innergemeinschaftliche Warenlieferungen
                          </SelectItem>
                          <SelectItem value="G">G - Freier Ausfuhrartikel, Steuer nicht erhoben</SelectItem>
                          <SelectItem value="O">O - Dienstleistungen außerhalb des Steueranwendungsbereichs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-billing-period-start-${index}`} className="flex items-center">
                        Startdatum
                        <span className="text-xs text-muted-foreground ml-1">(BT-134)</span>
                      </Label>
                      <Input
                        id={`invoice-item-billing-period-start-${index}`}
                        type="date"
                        value={item.period_start || ""}
                        onChange={(e) => handleInputChange(`trade.items.${index}.period_start`, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-billing-period-end-${index}`} className="flex items-center">
                        Enddatum
                        <span className="text-xs text-muted-foreground ml-1">(BT-135)</span>
                      </Label>
                      <Input
                        id={`invoice-item-billing-period-end-${index}`}
                        type="date"
                        value={item.period_end || ""}
                        onChange={(e) => handleInputChange(`trade.items.${index}.period_end`, e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-vat-amount-${index}`} className="flex items-center">
                        Steuerbetrag
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-item-vat-amount-${index}`}
                          type="number"
                          step="any"
                          value={item.settlement_tax?.amount || 0}
                          readOnly
                          disabled
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-net-amount-${index}`} className="flex items-center">
                        Gesamtpreis (Netto)
                        <span className="text-xs text-muted-foreground ml-1">(BT-131)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-item-net-amount-${index}`}
                          type="number"
                          step="any"
                          value={item.delivery_details || 0}
                          readOnly
                          disabled
                          className="bg-muted/30"
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-item-gross-amount-${index}`} className="flex items-center">
                        Gesamtpreis (Brutto)
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-item-gross-amount-${index}`}
                          type="number"
                          step="any"
                          value={item.total_amount || 0}
                          readOnly
                          disabled
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {formState.trade.items.length === 0 && (
                <Alert variant="warning">
                  <AlertDescription>Mindestens eine Rechnungsposition ist erforderlich.</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary" onClick={addItem} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Position hinzufügen
            </Button>
          </CardFooter>
        </Card>

        {/* Allowances Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">⬇️</span>
              Nachlässe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="invoice-allowances" className="space-y-6">
              {formState.trade.allowances?.map((allowance: any, index: number) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeAllowance(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`invoice-allowance-basis-amount-${index}`} className="flex items-center">
                        Grundbetrag<span className="text-xs text-muted-foreground ml-1">(BT-93)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-allowance-basis-amount-${index}`}
                          type="number"
                          step="any"
                          value={allowance.basis_amount || 0}
                          readOnly
                          disabled
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-allowance-percent-${index}`} className="flex items-center">
                        Prozent<span className="text-xs text-muted-foreground ml-1">(BT-94)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-allowance-percent-${index}`}
                          type="number"
                          step="any"
                          value={allowance.percent || 0}
                          onChange={(e) =>
                            handleInputChange(`trade.allowances.${index}.percent`, Number(e.target.value))
                          }
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">%</div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-allowance-amount-${index}`} className="flex items-center">
                        Betrag (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-92)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-allowance-amount-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={allowance.amount || 0}
                          onChange={(e) =>
                            handleInputChange(`trade.allowances.${index}.amount`, Number(e.target.value))
                          }
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`invoice-allowance-tax-category-${index}`} className="flex items-center">
                        Steuerkategorie<span className="text-xs text-muted-foreground ml-1">(BT-95)</span>
                      </Label>
                      <Select
                        value={allowance.tax_category || "S"}
                        onValueChange={(value) => handleInputChange(`trade.allowances.${index}.tax_category`, value)}
                      >
                        <SelectTrigger id={`invoice-allowance-tax-category-${index}`}>
                          <SelectValue placeholder="Steuerkategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S - Standard Rate</SelectItem>
                          <SelectItem value="Z">Z - Nach dem Nullsatz zu versteuernde Waren</SelectItem>
                          <SelectItem value="E">E - Steuerbefreit</SelectItem>
                          <SelectItem value="AE">AE - Umkehrung der Steuerschuldnerschaft</SelectItem>
                          <SelectItem value="K">
                            K - Umsatzsteuerbefreit für innergemeinschaftliche Warenlieferungen
                          </SelectItem>
                          <SelectItem value="G">G - Freier Ausfuhrartikel, Steuer nicht erhoben</SelectItem>
                          <SelectItem value="O">O - Dienstleistungen außerhalb des Steueranwendungsbereichs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-allowance-tax-rate-${index}`} className="flex items-center">
                        Steuersatz<span className="text-xs text-muted-foreground ml-1">(BT-96)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-allowance-tax-rate-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={allowance.tax_rate || 19}
                          onChange={(e) =>
                            handleInputChange(`trade.allowances.${index}.tax_rate`, Number(e.target.value))
                          }
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`invoice-allowance-reason-${index}`} className="flex items-center">
                      Grund<span className="text-xs text-muted-foreground ml-1">(BT-97)</span>
                    </Label>
                    <Input
                      id={`invoice-allowance-reason-${index}`}
                      className="bg-[var(--required-field-bg-color)]"
                      placeholder="Grund"
                      value={allowance.reason || ""}
                      onChange={(e) => handleInputChange(`trade.allowances.${index}.reason`, e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {(!formState.trade.allowances || formState.trade.allowances.length === 0) && (
                <div className="text-center p-4 border border-dashed rounded">
                  <p className="text-muted-foreground">Keine Nachlässe vorhanden</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={addAllowance} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Nachlass hinzufügen
            </Button>
          </CardFooter>
        </Card>

        {/* Charges Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">⬆️</span>
              Zuschläge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div id="invoice-charges" className="space-y-6">
              {formState.trade.charges?.map((charge: any, index: number) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeCharge(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`invoice-charge-basis-amount-${index}`} className="flex items-center">
                        Grundbetrag<span className="text-xs text-muted-foreground ml-1">(BT-93)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-charge-basis-amount-${index}`}
                          type="number"
                          step="any"
                          value={charge.basis_amount || 0}
                          readOnly
                          disabled
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-charge-percent-${index}`} className="flex items-center">
                        Prozent<span className="text-xs text-muted-foreground ml-1">(BT-94)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-charge-percent-${index}`}
                          type="number"
                          step="any"
                          value={charge.percent || 0}
                          onChange={(e) => handleInputChange(`trade.charges.${index}.percent`, Number(e.target.value))}
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">%</div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-charge-amount-${index}`} className="flex items-center">
                        Betrag (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-92)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-charge-amount-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={charge.amount || 0}
                          onChange={(e) => handleInputChange(`trade.charges.${index}.amount`, Number(e.target.value))}
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">
                          {formState.trade.settlement.currency_code || "€"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`invoice-charge-tax-category-${index}`} className="flex items-center">
                        Steuerkategorie<span className="text-xs text-muted-foreground ml-1">(BT-95)</span>
                      </Label>
                      <Select
                        value={charge.tax_category || "S"}
                        onValueChange={(value) => handleInputChange(`trade.charges.${index}.tax_category`, value)}
                      >
                        <SelectTrigger id={`invoice-charge-tax-category-${index}`}>
                          <SelectValue placeholder="Steuerkategorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">S - Standard Rate</SelectItem>
                          <SelectItem value="Z">Z - Nach dem Nullsatz zu versteuernde Waren</SelectItem>
                          <SelectItem value="E">E - Steuerbefreit</SelectItem>
                          <SelectItem value="AE">AE - Umkehrung der Steuerschuldnerschaft</SelectItem>
                          <SelectItem value="K">
                            K - Umsatzsteuerbefreit für innergemeinschaftliche Warenlieferungen
                          </SelectItem>
                          <SelectItem value="G">G - Freier Ausfuhrartikel, Steuer nicht erhoben</SelectItem>
                          <SelectItem value="O">O - Dienstleistungen außerhalb des Steueranwendungsbereichs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`invoice-charge-tax-rate-${index}`} className="flex items-center">
                        Steuersatz<span className="text-xs text-muted-foreground ml-1">(BT-96)</span>
                      </Label>
                      <div className="flex">
                        <Input
                          id={`invoice-charge-tax-rate-${index}`}
                          type="number"
                          step="any"
                          className="bg-[var(--required-field-bg-color)]"
                          value={charge.tax_rate || 19}
                          onChange={(e) => handleInputChange(`trade.charges.${index}.tax_rate`, Number(e.target.value))}
                        />
                        <div className="flex items-center px-3 border rounded-r-md bg-muted">%</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`invoice-charge-reason-${index}`} className="flex items-center">
                      Grund<span className="text-xs text-muted-foreground ml-1">(BT-97)</span>
                    </Label>
                    <Input
                      id={`invoice-charge-reason-${index}`}
                      className="bg-[var(--required-field-bg-color)]"
                      placeholder="Grund"
                      value={charge.reason || ""}
                      onChange={(e) => handleInputChange(`trade.charges.${index}.reason`, e.target.value)}
                    />
                  </div>
                </div>
              ))}

              {(!formState.trade.charges || formState.trade.charges.length === 0) && (
                <div className="text-center p-4 border border-dashed rounded">
                  <p className="text-muted-foreground">Keine Zuschläge vorhanden</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" onClick={addCharge} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Zuschlag hinzufügen
            </Button>
          </CardFooter>
        </Card>

        {/* Totals Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">💶</span>
              Gesamtsummen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoice-totals-items-net-amount" className="flex items-center">
                  Summe Positionen (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-106)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-items-net-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.items_net_total || 0}
                    readOnly
                    disabled
                    className="bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-allowances-net-amount" className="flex items-center">
                  Summe Nachlässe (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-107)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-allowances-net-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.allowances_net_total || 0}
                    readOnly
                    disabled
                    className="bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-charges-net-amount" className="flex items-center">
                  Summe Zuschläge (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-108)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-charges-net-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.charges_net_total || 0}
                    readOnly
                    disabled
                    className="bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="invoice-totals-net-amount" className="flex items-center">
                  Gesamt (Netto)<span className="text-xs text-muted-foreground ml-1">(BT-109)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-net-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.net_total || 0}
                    readOnly
                    disabled
                    className="bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-vat-amount" className="flex items-center">
                  Summe Umsatzsteuer<span className="text-xs text-muted-foreground ml-1">(BT-110)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-vat-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.tax_total || 0}
                    readOnly
                    disabled
                    className="bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-gross-amount" className="flex items-center">
                  Gesamt (Brutto)<span className="text-xs text-muted-foreground ml-1">(BT-112)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-gross-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.grand_total || 0}
                    readOnly
                    disabled
                    className="font-bold bg-muted/30"
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="invoice-totals-paid-amount" className="flex items-center">
                  Gezahlter Betrag<span className="text-xs text-muted-foreground ml-1">(BT-113)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-paid-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.paid_amount || 0}
                    onChange={(e) =>
                      handleInputChange("trade.settlement.monetary_summation.paid_amount", Number(e.target.value))
                    }
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-rounding-amount" className="flex items-center">
                  Rundungsbetrag<span className="text-xs text-muted-foreground ml-1">(BT-114)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-rounding-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.rounding_amount || 0}
                    onChange={(e) =>
                      handleInputChange("trade.settlement.monetary_summation.rounding_amount", Number(e.target.value))
                    }
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="invoice-totals-due-amount" className="flex items-center">
                  Fälliger Betrag<span className="text-xs text-muted-foreground ml-1">(BT-115)</span>
                </Label>
                <div className="flex">
                  <Input
                    id="invoice-totals-due-amount"
                    type="number"
                    step="any"
                    value={formState.trade.settlement.monetary_summation?.due_amount || 0}
                    readOnly
                    disabled
                  />
                  <div className="flex items-center px-3 border rounded-r-md bg-muted">
                    {formState.trade.settlement.currency_code || "€"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Options Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-muted-foreground">⚙️</span>
              Ausgabeoptionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-output-format">Format</Label>
                <Select
                  value={formState.output_format || "zugferd:xrechnung"}
                  onValueChange={(value) => handleInputChange("output_format", value)}
                >
                  <SelectTrigger id="invoice-output-format" className="border-primary">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zugferd:xrechnung">PDF / ZUGFeRD / XRechnung</SelectItem>
                    <SelectItem value="zugferd:en16931">PDF / ZUGFeRD / EN16931</SelectItem>
                    <SelectItem value="xrechnung:cii">XML / XRechnung / CII</SelectItem>
                    <SelectItem value="xrechnung:ubl">XML / XRechnung / UBL</SelectItem>
                    <SelectItem value="en16931:cii">XML / EN16931 / CII</SelectItem>
                    <SelectItem value="en16931:ubl">XML / EN16931 / UBL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="invoice-output-lang-code">Sprache</Label>
                <Select
                  value={formState.output_lang_code || "de"}
                  onValueChange={(value) => handleInputChange("output_lang_code", value)}
                >
                  <SelectTrigger id="invoice-output-lang-code">
                    <SelectValue placeholder="Sprache" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">DE</SelectItem>
                    <SelectItem value="en">EN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

