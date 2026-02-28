"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Loader2, Rocket, Zap, Crown, Bot } from "lucide-react";
import { CheckoutModal } from "./CheckoutModal";

interface PaymentPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackageSelected: (packageType: string, checkoutUrl: string) => void;
  botConfig?: {
    botToken: string;
    botUsername: string;
    selectedModel: string;
  } | null;
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

export function PaymentPackageModal({ isOpen, onClose, onPackageSelected, botConfig }: PaymentPackageModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card rounded-2xl p-3 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden">
              <img 
                src="/claw.jpg" 
                alt="Clawdwako" 
                className="w-full h-full object-cover"
                style={{
                  filter: 'hue-rotate(100deg) saturate(1.2) brightness(1.1)'
                }}
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5 sm:mb-1">Choose Your Package</h2>
              <p className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-gray-400">Select the perfect plan for your AI bot deployment</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Packages Grid */}
        <div className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-6 overflow-x-auto pb-3 pt-5 snap-x snap-mandatory md:overflow-visible -mx-1 px-1">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handlePackageClick(pkg.id)}
              className={`relative glass-stat-card rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer flex-shrink-0 w-[85vw] sm:w-auto snap-center md:snap-align-none ${
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
                <div className="absolute -top-4 sm:-top-3 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                  <span className="bg-green-400 text-white text-[9px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-2 sm:mb-4">
                <div className="inline-flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 bg-green-400/10 rounded-lg mb-1 sm:mb-2">
                  <pkg.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-400" />
                </div>
                <h3 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white mb-0.5 sm:mb-2">{pkg.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-0.5">
                  <span className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">${pkg.price}</span>
                </div>
                <span className="text-[9px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400">one-time payment</span>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-2 sm:mb-4 min-h-[120px] sm:min-h-[180px]">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 sm:gap-3">
                    <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mt-0.5 shadow-sm">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white stroke-[3.5]" />
                    </div>
                    <span className="text-[10px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPackage(pkg.id);
                }}
                disabled={!selectedPackage}
                className={`w-full text-xs sm:text-sm py-2 sm:py-3 font-bold rounded-xl transition-all duration-300 ${
                  selectedPackage === pkg.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 opacity-50'
                }`}
              >
                Select Package
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              💡 Have your own API key?
            </p>
            <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400">
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
        botConfig={botConfig}
      />
    </div>
  );
}
