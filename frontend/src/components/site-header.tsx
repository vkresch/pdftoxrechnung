"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { FileText, Info, Home, HelpCircle, HelpCircleIcon, HelpingHand } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 bg-secondary">
      <div className="flex w-full h-14 items-center px-4">
        <div className="mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6" />
            <span className="font-bold hidden sm:inline-block">PDF to XRechnung</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant={pathname === "/faq" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/faq">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Link>
            </Button>
            <Button variant={pathname === "/imprint" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/imprint">
                <Info className="h-4 w-4 mr-2" />
                Impressum
              </Link>
            </Button>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

