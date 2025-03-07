import type { Metadata } from "next"
import InvoiceConverter from "@/components/invoice-converter"

export const metadata: Metadata = {
  title: "PDF to XRechnung Converter",
  description: "Convert your PDF invoices to XRechnung format with ease",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-[1500px]">
        <h1 className="mb-4 text-center text-3xl font-bold tracking-tight">PDF to XRechnung Converter</h1>
        <p className="mb-8 text-center text-muted-foreground">
          Upload your invoice PDF and convert it to XRechnung format
        </p>
        <InvoiceConverter />
      </div>
    </main>
  )
}

