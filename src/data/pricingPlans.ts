export type FeatureItem = {
  label: string;
  value: string;
};

export type FeatureGroup = {
  title: string;
  items: FeatureItem[];
};

export type CtaStyle = "secondary" | "primary" | "primary_alt";

export type PricingPlan = {
  id: string;
  name: string;
  bestFor: string;
  price: number;
  monthlyPrice: number;
  currency: string;
  billing: string;
  highlights: string[];
  features: Record<string, FeatureItem[]>;
  cta: {
    text: string;
    style: CtaStyle;
  };
  featured: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    bestFor: "Solo builders & quick prototypes",
    price: 20,
    monthlyPrice: 10,
    currency: "USD",
    billing: "one-time",
    highlights: ["1 deployment", "≈1,000 messages / month"],
    features: {
      Capacity: [
        { label: "Deployments", value: "1" },
        { label: "Messages", value: "≈1,000 / month" },
        { label: "Active", value: "30 days" },
      ],
      "Support & Ops": [
        { label: "Support", value: "Basic" },
        { label: "Analytics", value: "Standard" },
        { label: "Integrations", value: "—" },
      ],
    },
    cta: { text: "Start with Starter", style: "secondary" },
    featured: false,
  },
  {
    id: "professional",
    name: "Professional",
    bestFor: "Teams shipping multiple agents",
    price: 50,
    monthlyPrice: 25,
    currency: "USD",
    billing: "one-time",
    highlights: ["3 deployments", "Priority support"],
    features: {
      Capacity: [
        { label: "Deployments", value: "3" },
        { label: "Messages", value: "≈3,000 / month" },
        { label: "Active", value: "90 days" },
      ],
      "Support & Ops": [
        { label: "Support", value: "Priority" },
        { label: "Analytics", value: "Advanced" },
        { label: "Integrations", value: "Standard" },
      ],
    },
    cta: { text: "Choose Professional", style: "primary" },
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    bestFor: "Scale, security, and custom workflows",
    price: 100,
    monthlyPrice: 50,
    currency: "USD",
    billing: "one-time",
    highlights: ["Unlimited deployments", "Custom integrations"],
    features: {
      Capacity: [
        { label: "Deployments", value: "Unlimited" },
        { label: "Messages", value: "≈7,000 / month" },
        { label: "Active", value: "365 days" },
      ],
      "Support & Ops": [
        { label: "Support", value: "24/7 Premium" },
        { label: "Analytics", value: "Advanced" },
        { label: "Integrations", value: "Custom" },
        { label: "Account manager", value: "Dedicated" },
      ],
    },
    cta: { text: "Choose Enterprise", style: "primary_alt" },
    featured: false,
  },
];

export const FOOTER_REASSURANCE = [
  "All plans include access to all supported AI models",
  "Secure checkout · Instant activation",
  "Upgrade anytime",
];
