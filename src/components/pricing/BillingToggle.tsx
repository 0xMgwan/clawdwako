"use client";

import { useState } from "react";

interface BillingToggleProps {
  value: "one-time" | "monthly";
  onChange: (value: "one-time" | "monthly") => void;
}

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false);

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
      <div className="relative">
        <button
          onClick={() => {}}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="rounded-full px-4 py-1.5 text-xs font-semibold text-muted-foreground/50 cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-pressed={false}
          aria-disabled="true"
          aria-describedby="monthly-tooltip"
        >
          Monthly
        </button>
        {showTooltip && (
          <div
            id="monthly-tooltip"
            role="tooltip"
            className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg"
          >
            Coming soon
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
