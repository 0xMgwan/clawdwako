"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Smartphone, ArrowLeft, Loader2, Check, Shield, Lock, Zap } from "lucide-react";
import { CountrySelector } from "@/components/CountrySelector";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageInfo: {
    id: string;
    name: string;
    price: number;
  } | null;
  onPaymentSuccess: () => void;
  botConfig?: {
    botToken: string;
    botUsername: string;
    selectedModel: string;
  } | null;
}

const MOBILE_MONEY_PROVIDERS = [
  { id: 'mpesa', name: 'M-Pesa', logo: '/M-pesa-logo.png' },
  { id: 'airtel', name: 'Airtel Money', logo: '/Airtel_Tanzania-Logo.wine.png' },
  { id: 'yas', name: 'Yas', logo: '/yas.jpg' },
  { id: 'cbe', name: 'CBE Birr', logo: '/CBE Birr.png' },
  { id: 'halotel', name: 'Halotel', logo: '/Logo_new_Halotel.png' },
  { id: 'mtn', name: 'MTN', logo: '/MTN.jpeg' },
  { id: 'orange', name: 'Orange Money', logo: '/orange-money-logo-png.png' },
  { id: 'telecel', name: 'Telecel', logo: '/telecel-zimbabwe-logo-png_seeklogo-430654.png' },
  { id: 'telebirr', name: 'Telebirr', logo: '/telebirr-logo.png' },
];

export function CheckoutModal({ isOpen, onClose, packageInfo, onPaymentSuccess, botConfig }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    country: 'Tanzania',
    addressLine1: '',
    addressLine2: '',
    postalCode: '',
    city: ''
  });
  const [processing, setProcessing] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cryptoProcessing, setCryptoProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [deployStatus, setDeployStatus] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');

  if (!isOpen || !packageInfo) return null;

  const handleBack = () => {
    if (paymentComplete) {
      setPaymentComplete(false);
      setPaymentMethod(null);
      setSelectedProvider(null);
      setPhoneNumber('');
      setCardDetails({ 
        number: '', 
        expiry: '', 
        cvv: '', 
        name: '',
        country: 'Tanzania',
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        city: ''
      });
      onClose();
    } else if (selectedProvider || cardDetails.number) {
      setSelectedProvider(null);
      setCardDetails({ 
        number: '', 
        expiry: '', 
        cvv: '', 
        name: '',
        country: 'Tanzania',
        addressLine1: '',
        addressLine2: '',
        postalCode: '',
        city: ''
      });
    } else if (paymentMethod) {
      setPaymentMethod(null);
    } else {
      onClose();
    }
  };

  const redirectToDashboard = async (reference?: string) => {
    setPaymentSuccess(true);
    setPaymentComplete(false);
    
    // Use passed reference (avoids stale closure) or fall back to state
    const ref = reference || paymentRef;
    console.log('redirectToDashboard called with ref:', ref, 'botConfig:', botConfig);
    
    // Deploy bot after successful payment — MUST complete before redirect
    if (botConfig && ref) {
      setDeployStatus('Deploying your AI bot...');
      try {
        console.log('Calling deploy-after-payment with reference:', ref);
        const deployResponse = await fetch('/api/payments/deploy-after-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentReference: ref })
        });
        
        const deployData = await deployResponse.json();
        console.log('Deploy response:', deployResponse.status, deployData);
        
        if (deployResponse.ok) {
          console.log('✅ Bot deployed after payment:', deployData);
          setDeployStatus('Bot deployed successfully! Redirecting...');
        } else {
          console.error('Bot deploy failed:', deployData.error);
          setDeployStatus('Deploy issue - redirecting to dashboard...');
        }
      } catch (error) {
        console.error('Deploy after payment error:', error);
        setDeployStatus('Deploy issue - redirecting to dashboard...');
      }
    } else {
      console.warn('Skipping deploy: botConfig=', botConfig, 'ref=', ref);
      setDeployStatus('Redirecting to dashboard...');
    }
    
    // Start countdown AFTER deploy completes (not in parallel)
    setRedirectCountdown(3);
    const countdownInterval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          onPaymentSuccess();
          window.location.replace('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Call Snippe API to create payment session
      const response = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: packageInfo?.id,
          paymentMethod: paymentMethod,
          provider: selectedProvider,
          phoneNumber: phoneNumber,
          cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
          botConfig: botConfig || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Get the payment reference for polling
      const paymentReference = data.reference || data.sessionId;
      setPaymentRef(paymentReference || '');
      console.log('Payment created:', { reference: data.reference, sessionId: data.sessionId, paymentReference, data });
      
      // Handle different payment methods
      if (data.paymentMethod === 'card' && data.checkoutUrl) {
        // Open Snippe checkout in new window for card payments
        const paymentWindow = window.open(data.checkoutUrl, '_blank', 'width=600,height=700');
        
        // Check if popup was blocked
        if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
          alert('Popup blocked! Please allow popups for this site and try again.\n\nOr click here to open payment page: ' + data.checkoutUrl);
          setProcessing(false);
          return;
        }
        
        // Show waiting message
        setProcessing(false);
        setPaymentComplete(true);
        
        // Only poll if we have a valid reference
        if (paymentReference) {
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(`/api/payments/status?reference=${paymentReference}`);
              if (!statusResponse.ok) return; // Skip this poll cycle on error
              const statusData = await statusResponse.json();
              
              if (statusData.status === 'completed') {
                clearInterval(pollInterval);
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                redirectToDashboard(paymentReference);
              } else if (statusData.status === 'failed') {
                clearInterval(pollInterval);
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                alert('Payment failed. Please try again.');
                onClose();
              }
            } catch (error) {
              console.error('Error checking payment status:', error);
            }
          }, 3000);
          
          // Stop polling after 10 minutes
          setTimeout(() => clearInterval(pollInterval), 600000);
        }
        return;
      }

      // For mobile money, show waiting message and poll for payment status
      setProcessing(false);
      setPaymentComplete(true);
      
      // Only poll if we have a valid reference
      if (paymentReference) {
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/payments/status?reference=${paymentReference}`);
            if (!statusResponse.ok) {
              console.log('Status poll error:', statusResponse.status);
              return;
            }
            const statusData = await statusResponse.json();
            console.log('Payment status poll:', statusData);
            
            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              redirectToDashboard(paymentReference);
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              alert('Payment failed. Please try again.');
              onClose();
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
        }, 3000);
        
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error: any) {
      setProcessing(false);
      alert(`Payment error: ${error.message}`);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <AnimatePresence>
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-card rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[96vh] overflow-y-auto shadow-2xl border border-border"
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-4 sm:p-5 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(paymentMethod || paymentComplete) && !paymentSuccess && (
                <button 
                  onClick={handleBack} 
                  disabled={processing || paymentSuccess}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-lg">
                    <img 
                      src="/claw.jpg" 
                      alt="Clawdwako" 
                      className="h-full w-full object-cover rounded-[10px]"
                      style={{
                        filter: 'hue-rotate(100deg) saturate(1.2) brightness(1.1)'
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full border-2 border-green-500" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {paymentSuccess ? 'Payment Successful!' : paymentComplete ? 'Processing Payment...' : 'Complete Payment'}
                  </h2>
                  <p className="text-xs text-white/80">
                    {packageInfo.name} &middot; <span className="font-bold text-white">${packageInfo.price}</span>
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              disabled={processing || paymentSuccess}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-4">

          {/* Payment Complete */}
          {(paymentComplete || paymentSuccess) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className={`absolute inset-0 rounded-full ${paymentSuccess ? 'bg-emerald-500/20' : 'bg-emerald-500/10'} ${!paymentSuccess ? 'animate-ping' : ''}`} />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  {paymentSuccess ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <Check className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : paymentMethod === 'card' ? (
                    <CreditCard className="w-7 h-7 text-white animate-pulse" />
                  ) : (
                    <Smartphone className="w-7 h-7 text-white animate-pulse" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {paymentSuccess 
                  ? 'Payment Successful!' 
                  : paymentMethod === 'card' 
                    ? 'Complete Payment' 
                    : 'Check Your Phone'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {paymentSuccess 
                  ? (deployStatus || `Redirecting to dashboard in ${redirectCountdown}s...`)
                  : paymentMethod === 'card' 
                    ? 'Please complete the payment in the popup window to continue.'
                    : 'A USSD prompt has been sent to your phone. Please complete the payment to continue.'}
              </p>
              {!paymentSuccess && (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent"></div>
                  <span>Waiting for confirmation...</span>
                </div>
              )}
              {paymentSuccess && (
                <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirmed! Redirecting...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Payment Method Selection */}
          {!paymentMethod && !paymentComplete && !paymentSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-sm font-medium">Select payment method</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All transactions are encrypted end-to-end</p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/50">
                  <Shield className="h-3.5 w-3.5" />
                  <Lock className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Card Payment */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setProcessing(true);
                  
                  try {
                    const response = await fetch('/api/payments/create-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        packageType: packageInfo?.id,
                        paymentMethod: 'card',
                        botConfig: botConfig || null
                      })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Payment failed');
                    
                    if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    } else {
                      throw new Error('No checkout URL received');
                    }
                  } catch (error: any) {
                    setCardProcessing(false);
                    alert(`Payment error: ${error.message}`);
                  }
                }}
                disabled={cardProcessing}
                className="group relative w-full rounded-xl bg-muted/50 border border-border hover:border-emerald-500/40 hover:bg-muted transition-all duration-300 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow shrink-0">
                      {cardProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <CreditCard className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground font-semibold leading-tight">
                          {cardProcessing ? 'Redirecting...' : 'Card Payment'}
                        </p>
                        {!cardProcessing && (
                          <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">Recommended</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {cardProcessing ? 'Please wait...' : 'Visa, Mastercard & more'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/visa.png" alt="Visa" className="h-3 w-auto object-contain dark:brightness-0 dark:invert dark:opacity-60" />
                    </span>
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/mastercard.png" alt="Mastercard" className="h-3 w-auto object-contain" />
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </motion.button>

              {/* Crypto Payment */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setCryptoProcessing(true);
                  
                  try {
                    const response = await fetch('/api/payments/create-session', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        packageType: packageInfo?.id,
                        paymentMethod: 'crypto',
                        botConfig: botConfig || null
                      })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Payment failed');
                    
                    if (data.checkoutUrl) {
                      window.location.href = data.checkoutUrl;
                    } else {
                      throw new Error('No checkout URL received');
                    }
                  } catch (error: any) {
                    setCryptoProcessing(false);
                    alert(`Payment error: ${error.message}`);
                  }
                }}
                disabled={cryptoProcessing}
                className="group relative w-full rounded-xl bg-muted/50 border border-border hover:border-amber-500/40 hover:bg-muted transition-all duration-300 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-shadow shrink-0">
                      {cryptoProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <img src="/usdc-logo.png" alt="USDC" className="w-5 h-5 object-contain" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground font-semibold leading-tight">
                          {cryptoProcessing ? 'Redirecting...' : 'Crypto Payment'}
                        </p>
                        {!cryptoProcessing && (
                          <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">Global</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {cryptoProcessing ? 'Please wait...' : 'BTC, ETH, USDC, USDT & more'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/usdc-logo.png" alt="USDC" className="h-3.5 w-auto object-contain" />
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </motion.button>

              {/* Mobile Money */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPaymentMethod('mobile')}
                className="group relative w-full rounded-xl bg-muted/50 border border-border hover:border-blue-500/40 hover:bg-muted transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between gap-3 px-3.5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow shrink-0">
                      <Smartphone className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground font-semibold leading-tight">Mobile Money</p>
                        <span className="text-[9px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">East Africa</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">M-Pesa, Airtel, Yas & more</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/M-pesa-logo.png" alt="M-Pesa" className="h-3.5 w-auto object-contain" />
                    </span>
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/Airtel_Tanzania-Logo.wine.png" alt="Airtel" className="h-3.5 w-auto object-contain" />
                    </span>
                    <span className="inline-flex h-6 items-center rounded-md bg-background border border-border px-1.5">
                      <img src="/yas.jpg" alt="Yas" className="h-3.5 w-auto object-contain rounded" />
                    </span>
                    <svg className="w-4 h-4 text-muted-foreground/40 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </motion.button>

              {/* Security footer */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground/50 text-[10px]">
                  <Lock className="h-3 w-3" />
                  <span>256-bit SSL encrypted</span>
                </div>
                <span className="text-border">&bull;</span>
                <div className="flex items-center gap-1.5 text-muted-foreground/50 text-[10px]">
                  <Zap className="h-3 w-3" />
                  <span>Instant confirmation</span>
                </div>
              </div>
            </motion.div>
          )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && !paymentComplete && !paymentSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs font-semibold text-foreground">Enter Payment Details</p>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Card information *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="**** **** 1234 1234"
                  maxLength={19}
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-t-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <img src="/visa.png" alt="Visa" className="h-4 w-auto object-contain opacity-40 dark:brightness-0 dark:invert dark:opacity-30" />
                  <img src="/mastercard.png" alt="Mastercard" className="h-4 w-auto object-contain opacity-40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <input type="text" placeholder="MM/YY" maxLength={5} value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-background border border-border border-t-0 rounded-bl-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" />
                <input type="text" placeholder="CVV" maxLength={4} value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2.5 bg-background border border-border border-t-0 border-l-0 rounded-br-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Cardholder Name *</label>
              <input type="text" placeholder="Full name on card" value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Country *</label>
              <div className="mb-1.5">
                <CountrySelector value={cardDetails.country} onChange={(country) => setCardDetails({ ...cardDetails, country })} />
              </div>
              <input type="text" placeholder="Address" value={cardDetails.addressLine1}
                onChange={(e) => setCardDetails({ ...cardDetails, addressLine1: e.target.value })}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all mb-1.5" />
              <div className="grid grid-cols-2 gap-1.5">
                <input type="text" placeholder="Postal code" value={cardDetails.postalCode}
                  onChange={(e) => setCardDetails({ ...cardDetails, postalCode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" />
                <input type="text" placeholder="City" value={cardDetails.city}
                  onChange={(e) => setCardDetails({ ...cardDetails, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" />
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name || !cardDetails.addressLine1 || !cardDetails.city}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white h-11 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
            >
              {processing ? <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</span> : 'Pay now'}
            </button>
          </motion.div>
        )}

        {/* Mobile Money Provider Selection */}
        {paymentMethod === 'mobile' && !selectedProvider && !paymentComplete && !paymentSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[11px] font-medium text-muted-foreground mb-3">Select your mobile money provider</p>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MONEY_PROVIDERS.map((provider, i) => (
                <motion.button
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedProvider(provider.id)}
                  className="group bg-muted/50 border border-border rounded-xl p-2.5 hover:border-primary/40 hover:bg-muted transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center p-1.5 border border-border group-hover:border-primary/30 transition-colors">
                      <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/M-pesa-logo.png'; }} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight group-hover:text-foreground transition-colors">{provider.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mobile Money Payment Form */}
        {paymentMethod === 'mobile' && selectedProvider && !paymentComplete && !paymentSuccess && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border">
              <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center p-1.5 border border-border shrink-0">
                <img
                  src={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.logo}
                  alt={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">Enter your phone number to pay</p>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-muted-foreground mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground text-xs placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all"
              />
              <p className="text-[10px] text-muted-foreground/60 mt-1">You will receive a USSD prompt to complete payment</p>
            </div>
            <button
              onClick={handlePayment}
              disabled={processing || !phoneNumber}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white h-11 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {processing ? <span className="flex items-center justify-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending prompt...</span> : 'Pay now'}
            </button>
          </motion.div>
        )}

        </div>
      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
}
