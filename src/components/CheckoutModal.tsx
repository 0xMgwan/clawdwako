"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, CreditCard, Smartphone, ArrowLeft, Loader2, Check } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageInfo: {
    id: string;
    name: string;
    price: number;
  } | null;
  onPaymentSuccess: () => void;
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

export function CheckoutModal({ isOpen, onClose, packageInfo, onPaymentSuccess }: CheckoutModalProps) {
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
  const [paymentComplete, setPaymentComplete] = useState(false);

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
          cardDetails: paymentMethod === 'card' ? cardDetails : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Handle different payment methods
      if (data.paymentMethod === 'card' && data.checkoutUrl) {
        // Redirect to Snippe checkout for card payments
        window.location.href = data.checkoutUrl;
        return;
      }

      // For mobile money, show waiting message and poll for payment status
      setProcessing(false);
      setPaymentComplete(true);
      
      // Poll for payment status
      const paymentReference = data.reference;
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/payments/status?reference=${paymentReference}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            onPaymentSuccess();
            // Redirect to dashboard
            window.location.href = '/dashboard';
          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            alert('Payment failed. Please try again.');
            onClose();
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }, 3000); // Check every 3 seconds
      
      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 300000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Logo Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(paymentMethod || paymentComplete) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack} 
                  disabled={processing}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-white p-1">
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
                  <h2 className="text-2xl font-bold text-white">
                    {paymentComplete ? 'Payment Successful!' : 'Complete Payment'}
                  </h2>
                  <p className="text-sm text-white/90">
                    {packageInfo.name} - TZS {(packageInfo.price * 2500).toLocaleString()} (${packageInfo.price})
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              disabled={processing}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">

          {/* Payment Complete */}
          {paymentComplete && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 shadow-lg">
                <Smartphone className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                Check Your Phone
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                A USSD prompt has been sent to your phone. Please complete the payment to continue.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span>Waiting for payment confirmation...</span>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {!paymentMethod && !paymentComplete && (
            <div className="space-y-3">
              <p className="text-gray-500 mb-4 text-sm font-medium">
                Choose your preferred payment method
              </p>

              {/* Card Payment */}
              <button
                onClick={() => setPaymentMethod('card')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-green-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-gray-900 font-medium">Card</p>
                  </div>
                </div>
              </button>

              {/* Mobile Money */}
              <button
                onClick={() => setPaymentMethod('mobile')}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-green-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-gray-900 font-medium">Mobile Money</p>
                  </div>
                </div>
              </button>
            </div>
          )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && !paymentComplete && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Card information
              </label>
              <input
                type="text"
                placeholder="1234 1234 1234 1234"
                maxLength={19}
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-t-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
              />
              <div className="grid grid-cols-2 gap-0">
                <input
                  type="text"
                  placeholder="MM / YY"
                  maxLength={5}
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 border-t-0 rounded-bl-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  maxLength={4}
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 border-t-0 border-l-0 rounded-br-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Cardholder name
              </label>
              <input
                type="text"
                placeholder="Full name on card"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Billing address
              </label>
              <select
                value={cardDetails.country}
                onChange={(e) => setCardDetails({ ...cardDetails, country: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none mb-2"
              >
                <option value="Tanzania">Tanzania</option>
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Ethiopia">Ethiopia</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Address line 1"
                value={cardDetails.addressLine1}
                onChange={(e) => setCardDetails({ ...cardDetails, addressLine1: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none mb-2"
              />
              <input
                type="text"
                placeholder="Address line 2"
                value={cardDetails.addressLine2}
                onChange={(e) => setCardDetails({ ...cardDetails, addressLine2: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Postal code"
                  value={cardDetails.postalCode}
                  onChange={(e) => setCardDetails({ ...cardDetails, postalCode: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={cardDetails.city}
                  onChange={(e) => setCardDetails({ ...cardDetails, city: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
                />
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={processing || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name || !cardDetails.addressLine1 || !cardDetails.city}
              className="w-full bg-green-500 hover:bg-green-600 text-white h-11 text-sm font-semibold rounded-lg transition-all"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay`
              )}
            </Button>
          </div>
        )}

        {/* Mobile Money Provider Selection */}
        {paymentMethod === 'mobile' && !selectedProvider && !paymentComplete && (
          <div className="space-y-3">
            <p className="text-gray-500 mb-3 text-sm">
              Select your mobile money provider
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MOBILE_MONEY_PROVIDERS.map((provider) => (
                <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-green-500 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm">
                    <img src={provider.logo} alt={provider.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = '/M-pesa-logo.png'; }} />
                  </div>
                  <span className="text-xs font-medium text-gray-900 text-center">{provider.name}</span>
                </div>
              </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Money Payment Form */}
        {paymentMethod === 'mobile' && selectedProvider && !paymentComplete && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2">
                <img 
                  src={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.logo} 
                  alt={MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                </h3>
                <p className="text-xs text-gray-500">Enter your phone number</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+255 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-green-400 outline-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                You will receive a prompt on your phone to complete the payment
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={processing || !phoneNumber}
              className="w-full bg-green-500 hover:bg-green-600 text-white h-11 text-sm font-semibold rounded-lg transition-all"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending prompt...
                </>
              ) : (
                `Pay`
              )}
            </Button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
