"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: string
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                isActive && "border-primary bg-primary text-primary-foreground",
                isCompleted && "border-primary bg-primary text-primary-foreground",
                !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
            </div>

            {/* Step label */}
            <span
              className={cn(
                "ml-2 text-sm font-medium",
                isActive && "text-primary",
                isCompleted && "text-primary",
                !isActive && !isCompleted && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn("w-12 h-0.5 mx-2", isCompleted ? "bg-primary" : "bg-muted-foreground/30")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

