import { AlertCircle, AlertTriangle } from "lucide-react"

interface ValidationMessage {
  id: string
  level: "error" | "warning"
  code: string
  message: string
  xpathLocation?: string
}

interface ValidationMessageDisplayProps {
  messages: ValidationMessage[]
  className?: string
  maxHeight?: string
  showLocations?: boolean
}

export function ValidationMessageDisplay({
  messages,
  className = "",
  maxHeight = "300px",
  showLocations = true,
}: ValidationMessageDisplayProps) {
  if (!messages || messages.length === 0) {
    return null
  }

  // Separate errors and warnings
  const errors = messages.filter((msg) => msg.level === "error")
  const warnings = messages.filter((msg) => msg.level === "warning")

  // Check if we're in a white text context based on the className
  const isWhiteTextContext = className.includes("text-white")

  return (
    <div className={`space-y-4 ${className}`} style={{ maxHeight, overflowY: "auto" }}>
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className={`font-medium flex items-center ${isWhiteTextContext ? "text-white" : "text-destructive"}`}>
            <AlertCircle className="h-4 w-4 mr-2" />
            Errors ({errors.length})
          </h4>
          <ul className="list-disc pl-5 space-y-2">
            {errors.map((msg) => (
              <li key={msg.id} className={isWhiteTextContext ? "text-white" : "text-destructive"}>
                <div>
                  <span className="font-semibold">{msg.code}</span>: {msg.message}
                </div>
                {showLocations && msg.xpathLocation && (
                  <div className={`text-xs ${isWhiteTextContext ? "opacity-90" : "opacity-80"} mt-0.5`}>
                    Location: {msg.xpathLocation}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4
            className={`font-medium flex items-center ${isWhiteTextContext ? "text-white" : "text-amber-600 dark:text-amber-400"}`}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Warnings ({warnings.length})
          </h4>
          <ul className="list-disc pl-5 space-y-2">
            {warnings.map((msg) => (
              <li key={msg.id} className={isWhiteTextContext ? "text-white" : "text-amber-600 dark:text-amber-400"}>
                <div>
                  <span className="font-semibold">{msg.code}</span>: {msg.message}
                </div>
                {showLocations && msg.xpathLocation && (
                  <div className={`text-xs ${isWhiteTextContext ? "opacity-90" : "opacity-80"} mt-0.5`}>
                    Location: {msg.xpathLocation}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
