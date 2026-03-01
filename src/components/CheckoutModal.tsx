"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, ArrowLeft, Loader2, Check, Shield, Lock, Zap, AlertCircle, ChevronRight, Coins } from "lucide-react";
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

type PaymentMethodId = 'card' | 'crypto' | 'mobile';

const PAYMENT_METHODS = [
  {
    id: 'card' as PaymentMethodId,
    title: 'Card',
    caption: 'Visa, Mastercard, and more',
    chip: 'Recommended',
    chipColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    accentFrom: 'from-emerald-400',
    accentTo: 'to-green-600',
    shadowColor: 'shadow-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    selectedBorder: 'border-emerald-500/50',
    selectedGlow: 'shadow-emerald-500/20',
    nextStep: "You'll be redirected to secure card checkout",
  },
  {
    id: 'crypto' as PaymentMethodId,
    title: 'Crypto',
    caption: 'BTC, ETH, USDC, USDT, and more',
    chip: 'Global',
    chipColor: 'text-amber-700 dark:text-amber-300 bg-amber-500/10 border-amber-500/20',
    accentFrom: 'from-amber-400',
    accentTo: 'to-orange-600',
    shadowColor: 'shadow-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    selectedBorder: 'border-amber-500/50',
    selectedGlow: 'shadow-amber-500/20',
    nextStep: "You'll be redirected to crypto payment gateway",
  },
  {
    id: 'mobile' as PaymentMethodId,
    title: 'Mobile Money',
    caption: 'M-Pesa, Airtel, Yas, and more',
    chip: 'East Africa',
    chipColor: 'text-blue-700 dark:text-blue-300 bg-blue-500/10 border-blue-500/20',
    accentFrom: 'from-blue-400',
    accentTo: 'to-indigo-600',
    shadowColor: 'shadow-blue-500/20',
    hoverBorder: 'hover:border-blue-500/40',
    selectedBorder: 'border-blue-500/50',
    selectedGlow: 'shadow-blue-500/20',
    nextStep: "Select your provider and enter your phone number",
  },
];

export function CheckoutModal({ isOpen, onClose, packageInfo, onPaymentSuccess, botConfig }: CheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('card');
  const [step, setStep] = useState<'select' | 'form' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '', expiry: '', cvv: '', name: '',
    country: 'Tanzania', addressLine1: '', addressLine2: '', postalCode: '', city: ''
  });
  const [processing, setProcessing] = useState(false);
  const [cardProcessing, setCardProcessing] = useState(false);
  const [cryptoProcessing, setCryptoProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [deployStatus, setDeployStatus] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [continueLoading, setContinueLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + ESC close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  const resetCardDetails = () => setCardDetails({
    number: '', expiry: '', cvv: '', name: '',
    country: 'Tanzania', addressLine1: '', addressLine2: '', postalCode: '', city: ''
  });

  const handleBack = useCallback(() => {
    if (paymentComplete) {
      setPaymentComplete(false); setPaymentMethod(null); setSelectedProvider(null);
      setPhoneNumber(''); resetCardDetails(); onClose();
    } else if (selectedProvider || cardDetails.number) {
      setSelectedProvider(null); resetCardDetails();
    } else if (paymentMethod) {
      setPaymentMethod(null); setStep('select');
    } else {
      onClose();
    }
  }, [paymentComplete, selectedProvider, cardDetails.number, paymentMethod, onClose]);

  const redirectToDashboard = async (reference?: string) => {
    setPaymentSuccess(true); setPaymentComplete(false); setStep('success');
    const ref = reference || paymentRef;
    if (botConfig && ref) {
      setDeployStatus('Deploying your AI agent...');
      try {
        const deployResponse = await fetch('/api/payments/deploy-after-payment', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentReference: ref })
        });
        const deployData = await deployResponse.json();
        if (deployResponse.ok) { setDeployStatus('Agent deployed successfully! Redirecting...'); }
        else { setDeployStatus('Deploy issue - redirecting to dashboard...'); }
      } catch { setDeployStatus('Deploy issue - redirecting to dashboard...'); }
    } else { setDeployStatus('Redirecting to dashboard...'); }
    setRedirectCountdown(3);
    const countdownInterval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownInterval); onPaymentSuccess(); window.location.replace('/dashboard'); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePayment = async () => {
    setProcessing(true); setError(null);
    try {
      const response = await fetch('/api/payments/create-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: packageInfo?.id, paymentMethod: paymentMethod,
          provider: selectedProvider, phoneNumber: phoneNumber,
          cardDetails: paymentMethod === 'card' ? cardDetails : undefined,
          botConfig: botConfig || null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');
      const paymentReference = data.reference || data.sessionId;
      setPaymentRef(paymentReference || '');
      if (data.paymentMethod === 'card' && data.checkoutUrl) {
        const paymentWindow = window.open(data.checkoutUrl, '_blank', 'width=600,height=700');
        if (!paymentWindow || paymentWindow.closed || typeof paymentWindow.closed === 'undefined') {
          alert('Popup blocked! Please allow popups for this site and try again.\n\nOr click here to open payment page: ' + data.checkoutUrl);
          setProcessing(false); return;
        }
        setProcessing(false); setPaymentComplete(true); setStep('processing');
        if (paymentReference) {
          const pollInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(`/api/payments/status?reference=${paymentReference}`);
              if (!statusResponse.ok) return;
              const statusData = await statusResponse.json();
              if (statusData.status === 'completed') { clearInterval(pollInterval); if (paymentWindow && !paymentWindow.closed) paymentWindow.close(); redirectToDashboard(paymentReference); }
              else if (statusData.status === 'failed') { clearInterval(pollInterval); if (paymentWindow && !paymentWindow.closed) paymentWindow.close(); setError('Payment failed. Please try again.'); setStep('select'); setPaymentComplete(false); }
            } catch {}
          }, 3000);
          setTimeout(() => clearInterval(pollInterval), 600000);
        }
        return;
      }
      setProcessing(false); setPaymentComplete(true); setStep('processing');
      if (paymentReference) {
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/payments/status?reference=${paymentReference}`);
            if (!statusResponse.ok) return;
            const statusData = await statusResponse.json();
            if (statusData.status === 'completed') { clearInterval(pollInterval); redirectToDashboard(paymentReference); }
            else if (statusData.status === 'failed') { clearInterval(pollInterval); setError('Payment failed. Please try again.'); setStep('select'); setPaymentComplete(false); }
          } catch {}
        }, 3000);
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error: any) {
      setProcessing(false); setError(error.message);
    }
  };

  const handleContinue = async () => {
    setContinueLoading(true); setError(null);
    if (selectedMethod === 'card') {
      try {
        const response = await fetch('/api/payments/create-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageType: packageInfo?.id, paymentMethod: 'card', botConfig: botConfig || null })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Payment failed');
        if (data.checkoutUrl) { window.location.href = data.checkoutUrl; } else { throw new Error('No checkout URL received'); }
      } catch (error: any) { setContinueLoading(false); setError(error.message); }
    } else if (selectedMethod === 'crypto') {
      try {
        const response = await fetch('/api/payments/create-session', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageType: packageInfo?.id, paymentMethod: 'crypto', botConfig: botConfig || null })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Payment failed');
        if (data.checkoutUrl) { window.location.href = data.checkoutUrl; } else { throw new Error('No checkout URL received'); }
      } catch (error: any) { setContinueLoading(false); setError(error.message); }
    } else if (selectedMethod === 'mobile') {
      setPaymentMethod('mobile'); setStep('form'); setContinueLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    return v;
  };

  if (!isOpen || !packageInfo) return null;

  const selectedMethodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl max-h-[96vh] overflow-hidden rounded-t-2xl sm:rounded-2xl border border-border bg-background/95 dark:bg-background/90 backdrop-blur-xl shadow-2xl flex flex-col"
        >
          {/* Top accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {/* Header */}
          <div className="relative border-b border-border px-4 pt-4 pb-3 sm:px-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {step !== 'select' && step !== 'success' && (
                  <button
                    onClick={handleBack}
                    disabled={processing || paymentSuccess}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div>
                  <h2 id="payment-modal-title" className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {step === 'success' ? 'Payment successful' : step === 'processing' ? 'Processing payment' : 'Complete payment'}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground">
                      {packageInfo.name}
                    </span>
                    <span className="text-[11px] font-semibold text-foreground">${packageInfo.price}</span>
                    <span className="text-[9px] text-muted-foreground">one-time</span>
                  </div>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                disabled={processing || paymentSuccess}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5">

            {/* ===== SUCCESS STATE ===== */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <Check className="w-7 h-7 text-white" />
                    </motion.div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mb-4">{deployStatus || `Redirecting to dashboard in ${redirectCountdown}s...`}</p>
                <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirmed! Redirecting...</span>
                </div>
              </motion.div>
            )}

            {/* ===== PROCESSING STATE ===== */}
            {step === 'processing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    {paymentMethod === 'card' ? <CreditCard className="w-7 h-7 text-white animate-pulse" /> : <Smartphone className="w-7 h-7 text-white animate-pulse" />}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {paymentMethod === 'card' ? 'Complete Payment' : 'Check Your Phone'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {paymentMethod === 'card' ? 'Please complete the payment in the popup window to continue.' : 'A USSD prompt has been sent to your phone. Please complete the payment to continue.'}
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent" />
                  <span>Waiting for confirmation...</span>
                </div>
              </motion.div>
            )}

            {/* ===== METHOD SELECTION ===== */}
            {step === 'select' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Choose a payment method</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Transactions are encrypted and processed securely.</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground/40">
                    <Shield className="h-3.5 w-3.5" />
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="space-y-2" role="radiogroup" aria-label="Payment methods">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => { setSelectedMethod(method.id); setError(null); }}
                        className={`
                          group relative w-full rounded-xl border text-left transition-all duration-200 ease-out
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                          ${isSelected
                            ? `${method.selectedBorder} bg-card shadow-md ${method.selectedGlow}`
                            : `border-border bg-card/60 hover:bg-card ${method.hoverBorder} hover:shadow-sm hover:-translate-y-px`
                          }
                        `}
                      >
                        {/* Selection glow */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                        )}
                        <div className="relative flex items-center gap-3 px-3.5 py-3">
                          {/* Icon tile */}
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${method.accentFrom} ${method.accentTo} shadow-md ${method.shadowColor} transition-shadow`}>
                            {method.id === 'card' && <CreditCard className="h-4 w-4 text-white" />}
                            {method.id === 'crypto' && <Coins className="h-4 w-4 text-white" />}
                            {method.id === 'mobile' && <Smartphone className="h-4 w-4 text-white" />}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-foreground">{method.title}</span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${method.chipColor}`}>
                                {method.chip}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{method.caption}</p>
                            {/* Next step hint */}
                            {isSelected && (
                              <p className="text-[9px] text-primary mt-0.5 font-medium">{method.nextStep}</p>
                            )}
                          </div>

                          {/* Brand logos */}
                          <div className="flex items-center gap-1 shrink-0 mr-2">
                            {method.id === 'card' && (
                              <>
                                <img src="/visa.png" alt="Visa" className="h-3.5 w-auto object-contain" />
                                <img src="/mastercard.png" alt="Mastercard" className="h-3.5 w-auto object-contain" />
                              </>
                            )}
                            {method.id === 'crypto' && (
                              <>
                                <img src="/usdc-logo.png" alt="USDC" className="h-3.5 w-auto object-contain" />
                                <img src="/USDT.png" alt="USDT" className="h-3.5 w-auto object-contain" />
                                <img src="/Ethereum.png" alt="Ethereum" className="h-3.5 w-auto object-contain" />
                              </>
                            )}
                            {method.id === 'mobile' && (
                              <>
                                <img src="/M-pesa-logo.png" alt="M-Pesa" className="h-3.5 w-auto object-contain" />
                                <img src="/Airtel_Tanzania-Logo.wine.png" alt="Airtel" className="h-3.5 w-auto object-contain" />
                              </>
                            )}
                          </div>

                          {/* Radio indicator */}
                          <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                    <p className="text-[11px] text-destructive flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-[9px] font-semibold text-destructive underline underline-offset-2">
                      Dismiss
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== MOBILE MONEY PROVIDER SELECTION ===== */}
            {step === 'form' && paymentMethod === 'mobile' && !selectedProvider && !paymentComplete && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-xs font-medium text-muted-foreground mb-3">Select your mobile money provider</p>
                <div className="grid grid-cols-3 gap-2">
                  {MOBILE_MONEY_PROVIDERS.map((provider, i) => (
                    <motion.button
                      key={provider.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedProvider(provider.id)}
                      className="group rounded-xl border border-border bg-card/60 p-2.5 hover:border-primary/40 hover:bg-card transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

            {/* ===== MOBILE MONEY PHONE FORM ===== */}
            {step === 'form' && paymentMethod === 'mobile' && selectedProvider && !paymentComplete && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card/60">
                  <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center p-1.5 border border-border shrink-0">
                    <img src={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}</p>
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {processing ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sending prompt...</span> : `Pay $${packageInfo.price} now`}
                </button>
              </motion.div>
            )}

          </div>

          {/* ===== STICKY FOOTER ===== */}
          {step === 'select' && (
            <div className="border-t border-border px-4 py-3 sm:px-5 bg-muted/30">
              {/* Trust row */}
              <div className="flex items-center justify-center gap-2.5 mb-2.5">
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Shield className="h-2.5 w-2.5 text-primary/60" />
                  <span>Secure checkout</span>
                </div>
                <span className="text-muted-foreground/30 text-[9px]">·</span>
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Lock className="h-2.5 w-2.5 text-primary/60" />
                  <span>Encrypted in transit</span>
                </div>
                <span className="text-muted-foreground/30 text-[9px]">·</span>
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Zap className="h-2.5 w-2.5 text-primary/60" />
                  <span>Instant confirmation</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="flex-1 h-9 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContinue}
                  disabled={continueLoading}
                  className="flex-[2] h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {continueLoading ? (
                    <span className="flex items-center justify-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Processing...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      Continue with {selectedMethodInfo?.title}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
