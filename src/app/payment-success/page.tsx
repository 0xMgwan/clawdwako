"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying payment...');
  const [countdown, setCountdown] = useState(3);
  const [stage, setStage] = useState<'verifying' | 'deploying' | 'success'>('verifying');

  useEffect(() => {
    const verifyAndDeploy = async () => {
      try {
        // Get payment reference from URL or latest payment
        const reference = searchParams.get('reference') || searchParams.get('payment_reference');
        
        if (!reference) {
          setStatus('Checking payment status...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Call deploy-after-payment which will verify and deploy
        setStage('deploying');
        setStatus('Deploying your AI bot to Railway...');
        
        const deployResponse = await fetch('/api/payments/deploy-after-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentReference: reference || 'latest' 
          })
        });

        const deployData = await deployResponse.json();
        
        if (deployResponse.ok) {
          setStage('success');
          setStatus('Your AI bot is now live and ready to use!');
          
          // Start countdown
          const countdownInterval = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                router.push('/dashboard');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setStage('success');
          setStatus('Payment verified! Setting up your bot...');
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      } catch (error: any) {
        console.error('Error:', error);
        setStage('success');
        setStatus('Payment received! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    };

    verifyAndDeploy();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 max-w-lg w-full text-center border border-white/20">
        {/* Success icon with animation */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110">
            {stage === 'verifying' && (
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
            )}
            {stage === 'deploying' && (
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {stage === 'success' && (
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Title with gradient */}
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-3 animate-fade-in">
          {stage === 'success' ? '🎉 Success!' : 'Processing...'}
        </h1>
        
        {/* Status message */}
        <p className="text-base sm:text-lg text-gray-700 mb-8 font-medium leading-relaxed">
          {status}
        </p>
        
        {/* Progress indicator */}
        <div className="relative mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${stage === 'verifying' ? 'bg-emerald-500 animate-pulse scale-125' : 'bg-emerald-400'}`}></div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${stage === 'deploying' ? 'bg-emerald-500 animate-pulse scale-125' : stage === 'success' ? 'bg-emerald-400' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${stage === 'success' ? 'bg-emerald-500 animate-pulse scale-125' : 'bg-gray-300'}`}></div>
          </div>
        </div>
        
        {/* Countdown with enhanced styling */}
        <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full border border-emerald-200/50 shadow-sm">
          <div className="relative">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
          </div>
          <span className="text-sm font-semibold text-emerald-700">
            Redirecting to dashboard in {countdown}s
          </span>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
