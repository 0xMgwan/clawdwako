"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Smartphone, ArrowLeft, Loader2, Check } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[96vh] overflow-y-auto shadow-2xl">
        {/* Logo Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 sm:p-4 rounded-t-2xl sm:rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(paymentMethod || paymentComplete) && !paymentSuccess && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack} 
                  disabled={processing || paymentSuccess}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg overflow-hidden bg-white p-0.5">
                  <img 
                    src="/claw.jpg" 
                    alt="Clawdwako" 
                    className="h-full w-full object-cover rounded"
                    style={{
                      filter: 'hue-rotate(100deg) saturate(1.2) brightness(1.1)'
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {paymentSuccess ? 'Payment Successful!' : paymentComplete ? 'Processing Payment...' : 'Complete Payment'}
                  </h2>
                  <p className="text-xs text-white/90">
                    {packageInfo.name} - <span className="font-bold">${packageInfo.price}</span>
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              disabled={processing || paymentSuccess}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">

          {/* Payment Complete */}
          {(paymentComplete || paymentSuccess) && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-3 shadow-lg">
                {paymentSuccess ? (
                  <Check className="w-7 h-7 text-white" />
                ) : paymentMethod === 'card' ? (
                  <CreditCard className="w-7 h-7 text-white animate-pulse" />
                ) : (
                  <Smartphone className="w-7 h-7 text-white animate-pulse" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">
                {paymentSuccess 
                  ? 'Payment Successful!' 
                  : paymentMethod === 'card' 
                    ? 'Complete Payment' 
                    : 'Check Your Phone'}
              </h3>
              <p className="text-gray-600 mb-3 text-sm">
                {paymentSuccess 
                  ? (deployStatus || `Redirecting to dashboard in ${redirectCountdown}s...`)
                  : paymentMethod === 'card' 
                    ? 'Please complete the payment in the popup window to continue.'
                    : 'A USSD prompt has been sent to your phone. Please complete the payment to continue.'}
              </p>
              {!paymentSuccess && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                  <span>Waiting for payment confirmation...</span>
                </div>
              )}
              {paymentSuccess && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Payment confirmed! Redirecting...</span>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          {!paymentMethod && !paymentComplete && !paymentSuccess && (
            <div className="space-y-2.5">
              <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-2.5">
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-emerald-200/30 blur-xl" />
                <p className="relative text-gray-900 text-sm font-semibold tracking-tight">Choose your payment rail</p>
                <p className="relative text-[10px] text-gray-500 mt-0.5">Secure checkout • encrypted end-to-end</p>
              </div>

              {/* Card Payment */}
              <button
                onClick={async () => {
                  setProcessing(true);
                  
                  // Create payment session and redirect to Snippe
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
                      // Redirect to Snippe checkout page
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
                className="group relative w-full rounded-xl p-[1.5px] bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 shadow-[0_8px_20px_-12px_rgba(16,185,129,0.9)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                <div className="relative overflow-hidden rounded-[11px] bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/55 px-3 py-2.5">
                  <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-emerald-300/30 blur-lg" />
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                        {cardProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <CreditCard className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-900 font-bold leading-tight">
                            {cardProcessing ? 'Redirecting...' : 'Card Payment'}
                          </p>
                          {!cardProcessing && (
                            <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full">Recommended</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {cardProcessing ? 'Please wait...' : 'Visa, Mastercard & more'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="inline-flex h-5 items-center rounded bg-white border border-gray-200 px-1 shadow-sm">
                        <img src="/visa.png" alt="Visa" className="h-3 w-auto object-contain" />
                      </span>
                      <span className="inline-flex h-5 items-center rounded bg-white border border-gray-200 px-1 shadow-sm">
                        <img src="/mastercard.png" alt="Mastercard" className="h-3 w-auto object-contain" />
                      </span>
                      <span className="text-emerald-600 text-sm font-semibold">›</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Crypto Payment */}
              <button
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
                className="group relative w-full rounded-xl p-[1.5px] bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 shadow-[0_8px_20px_-12px_rgba(251,146,60,0.85)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
              >
                <div className="relative overflow-hidden rounded-[11px] bg-gradient-to-br from-white via-orange-50/40 to-amber-100/50 px-3 py-2.5">
                  <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-orange-300/30 blur-lg" />
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                        {cryptoProcessing ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                        ) : (
                          <img src="/usdc-logo.png" alt="USDC" className="w-5 h-5 object-contain" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-900 font-bold leading-tight">
                            {cryptoProcessing ? 'Redirecting...' : 'Crypto Payment'}
                          </p>
                          {!cryptoProcessing && (
                            <span className="text-[9px] font-semibold text-orange-800 bg-orange-100 border border-orange-200 px-1.5 py-0.5 rounded-full">Global</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {cryptoProcessing ? 'Please wait...' : 'BTC, ETH, USDC, USDT & more'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <img src="/usdc-logo.png" alt="USDC" className="h-4 w-4 object-contain" />
                      <span className="text-orange-600 text-sm font-semibold">›</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => setPaymentMethod('mobile')}
                className="group relative w-full rounded-xl p-[1.5px] bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 shadow-[0_8px_20px_-12px_rgba(37,99,235,0.85)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="relative overflow-hidden rounded-[11px] bg-gradient-to-br from-white via-blue-50/40 to-indigo-100/50 px-3 py-2.5">
                  <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-blue-300/30 blur-lg" />
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-gray-900 font-bold leading-tight">Mobile Money</p>
                          <span className="text-[9px] font-semibold text-blue-800 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full">East Africa</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">M-Pesa, Airtel, Yas & more</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="inline-flex h-5 items-center rounded bg-white border border-gray-200 px-1 shadow-sm">
                        <img src="/M-pesa-logo.png" alt="M-Pesa" className="h-3 w-auto object-contain" />
                      </span>
                      <span className="inline-flex h-5 items-center rounded bg-white border border-gray-200 px-1 shadow-sm">
                        <img src="/Airtel_Tanzania-Logo.wine.png" alt="Airtel" className="h-3 w-auto object-contain" />
                      </span>
                      <span className="inline-flex h-5 items-center rounded bg-white border border-gray-200 px-1 shadow-sm">
                        <img src="/yas.jpg" alt="Yas" className="h-3 w-auto object-contain rounded" />
                      </span>
                      <span className="text-blue-600 text-sm font-semibold">›</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && !paymentComplete && !paymentSuccess && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-700">Enter Payment Details</p>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Card information *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="**** **** 1234 1234"
                  maxLength={19}
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-t-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <img src="/visa.png" alt="Visa" className="h-4 w-auto object-contain opacity-60" />
                  <img src="/mastercard.png" alt="Mastercard" className="h-4 w-auto object-contain opacity-60" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0">
                <input type="text" placeholder="MM/YY" maxLength={5} value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 border-t-0 rounded-bl-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
                <input type="text" placeholder="CVV" maxLength={4} value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 border-t-0 border-l-0 rounded-br-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Cardholder Name *</label>
              <input type="text" placeholder="Full name on card" value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Country *</label>
              <div className="mb-1.5">
                <CountrySelector value={cardDetails.country} onChange={(country) => setCardDetails({ ...cardDetails, country })} />
              </div>
              <input type="text" placeholder="Address" value={cardDetails.addressLine1}
                onChange={(e) => setCardDetails({ ...cardDetails, addressLine1: e.target.value })}
                className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none mb-1.5" />
              <div className="grid grid-cols-2 gap-1.5">
                <input type="text" placeholder="Postal code" value={cardDetails.postalCode}
                  onChange={(e) => setCardDetails({ ...cardDetails, postalCode: e.target.value })}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
                <input type="text" placeholder="City" value={cardDetails.city}
                  onChange={(e) => setCardDetails({ ...cardDetails, city: e.target.value })}
                  className="w-full px-2.5 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
              </div>
            </div>
            <Button
              onClick={handlePayment}
              disabled={processing || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name || !cardDetails.addressLine1 || !cardDetails.city}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-10 text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg mt-1"
            >
              {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : 'Pay now'}
            </Button>
          </div>
        )}

        {/* Mobile Money Provider Selection */}
        {paymentMethod === 'mobile' && !selectedProvider && !paymentComplete && !paymentSuccess && (
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-2">Select your mobile money provider</p>
            <div className="grid grid-cols-3 gap-2">
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 hover:border-green-500 hover:bg-green-50 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm">
                      <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/M-pesa-logo.png'; }} />
                    </div>
                    <span className="text-[10px] font-medium text-gray-800 text-center leading-tight">{provider.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Money Payment Form */}
        {paymentMethod === 'mobile' && selectedProvider && !paymentComplete && !paymentSuccess && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm shrink-0">
                <img
                  src={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.logo}
                  alt={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                </p>
                <p className="text-[10px] text-gray-500">Enter your phone number to pay</p>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-gray-500 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-2.5 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">You will receive a USSD prompt to complete payment</p>
            </div>
            <Button
              onClick={handlePayment}
              disabled={processing || !phoneNumber}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-10 text-sm font-bold rounded-xl transition-all shadow-md"
            >
              {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending prompt...</> : 'Pay now'}
            </Button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
