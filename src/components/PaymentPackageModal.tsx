"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2, Rocket, Zap, Crown } from "lucide-react";
import { CheckoutModal } from "./CheckoutModal";

interface PaymentPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageSelected: (packageType: string, checkoutUrl: string) => void;
}

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    features: [
      '1 AI Bot Deployment',
      'All AI Models Available',
      '~1,000 Messages/Month',
      'Basic Support',
      '30 Days Active'
    ],
    popular: false,
    icon: Rocket
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 50,
    features: [
      '3 AI Bot Deployments',
      'All AI Models Available',
      '~3,000 Messages/Month',
      'Priority Support',
      '90 Days Active',
      'Advanced Analytics'
    ],
    popular: true,
    icon: Zap
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 100,
    features: [
      'Unlimited Bot Deployments',
      'All AI Models Available',
      '~7,000 Messages/Month',
      '24/7 Premium Support',
      '365 Days Active',
      'Advanced Analytics',
      'Custom Integrations',
      'Dedicated Account Manager'
    ],
    popular: false,
    icon: Crown
  }
];

export function PaymentPackageModal({ isOpen, onClose, onPackageSelected }: PaymentPackageModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  const handlePackageClick = (packageId: string) => {
    setSelectedPackage(packageId);
  };

  const handleSelectPackage = (packageId: string) => {
    if (!selectedPackage) {
      setSelectedPackage(packageId);
      return;
    }
    
    setShowCheckout(true);
  };

  const handlePaymentSuccess = () => {
    onPackageSelected(selectedPackage!, 'checkout-complete');
    setShowCheckout(false);
    setSelectedPackage(null);
    onClose();
  };

  const selectedPackageInfo = selectedPackage ? PACKAGES.find(p => p.id === selectedPackage) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Choose Your Package</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select the perfect plan for your AI bot deployment</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handlePackageClick(pkg.id)}
              className={`relative glass-stat-card rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                pkg.popular
                  ? 'ring-2 ring-green-400 scale-105'
                  : ''
              } ${
                selectedPackage === pkg.id 
                  ? 'ring-2 ring-green-400 bg-gradient-to-br from-green-400/20 via-green-400/10 to-transparent shadow-lg shadow-green-400/20 scale-105' 
                  : 'hover:ring-1 hover:ring-green-400/50 hover:bg-green-400/5'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-green-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-400/10 rounded-lg mb-2">
                  <pkg.icon className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${pkg.price}</span>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">one-time payment</span>
              </div>

              <ul className="space-y-2 mb-4 min-h-[180px]">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPackage(pkg.id);
                }}
                disabled={!selectedPackage}
                className={`w-full ${
                  selectedPackage === pkg.id
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 opacity-50'
                }`}
              >
                Select Package
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              💡 Have your own API key?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              You can skip payment and deploy directly using your own API credits. Just add your API key on the homepage or in the Telegram connection modal.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        packageInfo={selectedPackageInfo ? {
          id: selectedPackageInfo.id,
          name: selectedPackageInfo.name,
          price: selectedPackageInfo.price
        } : null}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
