"use client";

import { Check, Minus, Loader2 } from "lucide-react";
import type { PricingPlan } from "@/data/pricingPlans";

interface PricingCardProps {
  plan: PricingPlan;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (planId: string) => void;
  onCardClick: (planId: string) => void;
}

export function PricingCard({
  plan,
  isSelected,
  isLoading,
  onSelect,
  onCardClick,
}: PricingCardProps) {
  const isFeatured = plan.featured;

  const ctaClasses = (() => {
    if (isLoading) {
      return "bg-primary text-primary-foreground opacity-70 cursor-wait";
    }
    switch (plan.cta.style) {
      case "primary":
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40";
      case "primary_alt":
        return "bg-primary/90 text-primary-foreground hover:bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/35";
      case "secondary":
      default:
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border";
    }
  })();

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={`${plan.name} plan, $${plan.price} ${plan.billing}`}
      tabIndex={0}
      onClick={() => onCardClick(plan.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick(plan.id);
        }
      }}
      className={`
        relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-all duration-200 ease-out cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${isFeatured
          ? "bg-card border-primary/30 dark:border-primary/40 shadow-lg shadow-primary/10 dark:shadow-primary/5 scale-[1.02] sm:scale-105"
          : "bg-card border-border shadow-sm"
        }
        ${isSelected
          ? "ring-2 ring-primary border-primary/50 shadow-lg shadow-primary/20"
          : "hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      {/* Featured badge */}
      {isFeatured && (
        <div className="mb-3">
          <span className="inline-block rounded-full bg-primary/15 dark:bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Most popular
          </span>
        </div>
      )}

      {/* Plan name + best for */}
      <div className={isFeatured ? "" : "mt-1"}>
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.bestFor}</p>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-5xl font-bold tracking-tight text-foreground">
          ${plan.price}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {plan.billing}
        </span>
      </div>

      {/* Highlights */}
      <div className="mt-4 flex flex-wrap gap-2">
        {plan.highlights.map((highlight) => (
          <span
            key={highlight}
            className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary"
          >
            {highlight}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="my-5 h-px bg-border" />

      {/* Feature groups */}
      <div className="flex-1 space-y-4">
        {Object.entries(plan.features).map(([groupTitle, items]) => (
          <div key={groupTitle}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {groupTitle}
            </h4>
            <ul className="space-y-2" role="list">
              {items.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  {item.value === "—" ? (
                    <Minus className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  ) : (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="text-sm text-foreground/80">
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {item.value !== "—" ? item.value : "Not included"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(plan.id);
        }}
        disabled={isLoading}
        aria-label={isLoading ? "Processing payment" : plan.cta.text}
        className={`
          mt-6 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
          disabled:cursor-not-allowed
          ${ctaClasses}
        `}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </span>
        ) : (
          plan.cta.text
        )}
      </button>
    </div>
  );
}
