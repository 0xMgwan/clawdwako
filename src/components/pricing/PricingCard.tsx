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
        relative flex flex-col rounded-xl border p-4 sm:p-5 transition-all duration-200 ease-out cursor-pointer
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
        <div className="mb-2">
          <span className="inline-block rounded-full bg-primary/15 dark:bg-primary/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Most popular
          </span>
        </div>
      )}

      {/* Plan name + best for */}
      <div className={isFeatured ? "" : "mt-0.5"}>
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{plan.bestFor}</p>
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          ${plan.price}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {plan.billing}
        </span>
      </div>

      {/* Highlights */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {plan.highlights.map((highlight) => (
          <span
            key={highlight}
            className="inline-flex items-center rounded-full bg-primary/10 dark:bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary"
          >
            {highlight}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-border" />

      {/* Feature groups */}
      <div className="flex-1 space-y-3">
        {Object.entries(plan.features).map(([groupTitle, items]) => (
          <div key={groupTitle}>
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {groupTitle}
            </h4>
            <ul className="space-y-1.5" role="list">
              {items.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  {item.value === "—" ? (
                    <Minus className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  ) : (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                  <span className="text-xs text-foreground/80">
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
          mt-4 w-full rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
          disabled:cursor-not-allowed
          ${ctaClasses}
        `}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Processing…
          </span>
        ) : (
          plan.cta.text
        )}
      </button>
    </div>
  );
}
