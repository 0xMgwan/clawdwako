"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying payment...');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyAndDeploy = async () => {
      try {
        // Get payment reference from URL or latest payment
        const reference = searchParams.get('reference') || searchParams.get('payment_reference');
        
        if (!reference) {
          // If no reference in URL, get the most recent pending payment
          setStatus('Checking payment status...');
          
          // Wait a moment for webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Call deploy-after-payment which will verify and deploy
        setStatus('Deploying your AI bot...');
        
        const deployResponse = await fetch('/api/payments/deploy-after-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentReference: reference || 'latest' 
          })
        });

        const deployData = await deployResponse.json();
        
        if (deployResponse.ok) {
          setStatus('Bot deployed successfully! Redirecting to dashboard...');
          
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
          setStatus('Payment verified! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 3000);
        }
      } catch (error: any) {
        console.error('Error:', error);
        setStatus('Payment received! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    };

    verifyAndDeploy();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">{status}</p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          <span>Redirecting in {countdown}s...</span>
        </div>
      </div>
    </div>
  );
}
