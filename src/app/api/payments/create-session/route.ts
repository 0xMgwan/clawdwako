import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const SNIPPE_API_KEY = process.env.SNIPPE_API_KEY;
const SNIPPE_API_URL = 'https://api.snippe.sh';

const PACKAGES = {
  starter: { amount: 20, name: 'Starter Package' },
  professional: { amount: 50, name: 'Professional Package' },
  enterprise: { amount: 100, name: 'Enterprise Package' }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageType, phoneNumber, paymentMethod, provider } = await request.json();

    if (!packageType || !PACKAGES[packageType as keyof typeof PACKAGES]) {
      return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
    }

    // Check if Snippe API key is configured
    if (!SNIPPE_API_KEY) {
      console.error('SNIPPE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please add SNIPPE_API_KEY to environment variables.' },
        { status: 500 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const pkg = PACKAGES[packageType as keyof typeof PACKAGES];
    const amountInCents = pkg.amount * 100; // Convert to cents

    console.log('Creating Snippe payment session:', {
      package: packageType,
      amount: amountInCents,
      currency: 'USD'
    });

    // Validate phone number for mobile money
    if (paymentMethod === 'mobile' && !phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required for mobile money payments' }, { status: 400 });
    }

    // Create Snippe payment
    const nameParts = (user.name || 'Customer Name').split(' ');
    const requestBody = {
      phone_number: phoneNumber || '+255000000000',
      details: {
        amount: amountInCents,
        currency: 'TZS',
        description: `${pkg.name} - Bot Deployment`
      },
      customer: {
        firstname: nameParts[0] || 'Customer',
        lastname: nameParts[1] || 'Name',
        email: user.email
      },
      callback_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/snippe`,
      metadata: {
        userId: user.id,
        package: packageType,
        email: user.email,
        paymentMethod: paymentMethod,
        provider: provider
      }
    };

    console.log('Snippe API request:', {
      url: `${SNIPPE_API_URL}/v1/payments`,
      body: requestBody
    });

    const snippeResponse = await fetch(`${SNIPPE_API_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SNIPPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await snippeResponse.text();
    console.log('Snippe API response status:', snippeResponse.status);
    console.log('Snippe API response:', responseText);

    if (!snippeResponse.ok) {
      console.error('Snippe API error:', responseText);
      return NextResponse.json(
        { error: `Failed to create payment session: ${responseText}` },
        { status: 500 }
      );
    }

    const snippeData = JSON.parse(responseText);

    // Store payment in database
    await prisma.payment.create({
      data: {
        userId: user.id,
        sessionId: snippeData.data?.id || snippeData.data?.reference,
        reference: snippeData.data?.reference,
        amount: amountInCents,
        currency: 'TZS',
        package: packageType,
        status: 'pending',
        checkoutUrl: snippeData.data?.payment_url || snippeData.data?.checkout_url,
        metadata: snippeData.data || {}
      }
    });

    // For mobile money, the user should receive USSD prompt
    // For card, redirect to payment URL
    return NextResponse.json({
      success: true,
      paymentMethod: paymentMethod,
      message: paymentMethod === 'mobile' 
        ? 'USSD prompt sent to your phone. Please check your phone to complete payment.'
        : 'Redirecting to payment page...',
      checkoutUrl: paymentMethod === 'card' ? (snippeData.data?.payment_url || snippeData.data?.checkout_url) : null,
      sessionId: snippeData.data?.id || snippeData.data?.reference,
      reference: snippeData.data?.reference,
      status: snippeData.data?.status,
      data: snippeData.data
    });
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
