import type { Metadata } from "next"
import XRechnungGenerator from "@/components/xrechnung-generator"

export const metadata: Metadata = {
  title: "XRechnung Generator",
  description: "Convert PDF invoices to XRechnung XML format",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full h-screen">
        <XRechnungGenerator />
      </div>
    </main>
  )
}

