"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Shield, Zap, ArrowUpRight, AlertCircle } from "lucide-react";
import { PRICING_PLANS, FOOTER_REASSURANCE } from "@/data/pricingPlans";
import { PricingCard } from "./PricingCard";
import { BillingToggle } from "./BillingToggle";
import { CheckoutModal } from "@/components/CheckoutModal";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
  botConfig?: {
    botToken: string;
    botUsername: string;
    selectedModel: string;
  } | null;
}

export function PricingModal({
  open,
  onClose,
  onSelectPlan,
  botConfig,
}: PricingModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"one-time" | "monthly">(
    "one-time"
  );
  const [error, setError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store the previously focused element and focus the modal on open
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Small delay for the DOM to render
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
      setSelectedPlan(null);
      setLoadingPlan(null);
      setError(null);
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const modal = modalRef.current;
    if (!modal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }

      // Arrow key navigation between cards
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const cards = modal.querySelectorAll<HTMLElement>('[role="radio"]');
        const currentIndex = Array.from(cards).findIndex(
          (card) => card === document.activeElement
        );
        if (currentIndex === -1) return;

        e.preventDefault();
        const nextIndex =
          e.key === "ArrowRight"
            ? (currentIndex + 1) % cards.length
            : (currentIndex - 1 + cards.length) % cards.length;
        cards[nextIndex]?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleCardClick = useCallback((planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  }, []);

  const handleSelectPlan = useCallback(
    (planId: string) => {
      setSelectedPlan(planId);
      setError(null);
      setShowCheckout(true);
    },
    []
  );

  const handlePaymentSuccess = useCallback(() => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
    setShowCheckout(false);
    setSelectedPlan(null);
    onClose();
  }, [selectedPlan, onSelectPlan, onClose]);

  if (!open) return null;

  const selectedPlanInfo = selectedPlan
    ? PRICING_PLANS.find((p) => p.id === selectedPlan)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 sm:p-6 lg:p-10"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-label="Choose your plan"
      >
        {/* Modal container */}
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl rounded-2xl border border-border bg-background shadow-2xl my-auto"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Choose a plan that matches your rollout
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Deploy AI bots in minutes. Upgrade anytime.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close pricing modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Billing toggle row */}
          <div className="flex items-center justify-center px-5 py-4 sm:px-8">
            <BillingToggle value={billingCycle} onChange={setBillingCycle} />
          </div>

          {/* Cards grid */}
          <div
            className="grid grid-cols-1 gap-4 px-5 sm:gap-6 sm:px-8 md:grid-cols-3"
            role="radiogroup"
            aria-label="Pricing plans"
          >
            {PRICING_PLANS.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                isLoading={loadingPlan === plan.id}
                onSelect={handleSelectPlan}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {/* Error state */}
          {error && (
            <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 sm:mx-8">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  if (selectedPlan) handleSelectPlan(selectedPlan);
                }}
                className="ml-auto text-xs font-semibold text-destructive underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Retry
              </button>
            </div>
          )}

          {/* API key note */}
          <div className="mx-5 mt-4 sm:mx-8">
            <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 px-4 py-3">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                💡 Have your own API key?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Skip payment and deploy directly using your own API credits. Add
                your key on the homepage or in the Telegram connection modal.
              </p>
            </div>
          </div>

          {/* Footer reassurance */}
          <div className="border-t border-border mt-6 px-5 py-5 sm:px-8 sm:py-6">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {FOOTER_REASSURANCE.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  {i === 0 && <Zap className="h-3.5 w-3.5 text-primary" />}
                  {i === 1 && <Shield className="h-3.5 w-3.5 text-primary" />}
                  {i === 2 && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground/60">
              Questions?{" "}
              <a
                href="#"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Chat with support
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        packageInfo={
          selectedPlanInfo
            ? {
                id: selectedPlanInfo.id,
                name: selectedPlanInfo.name,
                price: selectedPlanInfo.price,
              }
            : null
        }
        onPaymentSuccess={handlePaymentSuccess}
        botConfig={botConfig}
      />
    </>
  );
}
