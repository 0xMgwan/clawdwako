"use client";

import { useState } from "react";

interface BillingToggleProps {
  value: "one-time" | "monthly";
  onChange: (value: "one-time" | "monthly") => void;
}

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 p-1">
      <button
        onClick={() => onChange("one-time")}
        className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          value === "one-time"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={value === "one-time"}
      >
        One-time
      </button>
      <button
        onClick={() => onChange("monthly")}
        className={`relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          value === "monthly"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-pressed={value === "monthly"}
      >
        Monthly
      </button>
    </div>
  );
}
