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

    const { packageType } = await request.json();

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

    // Create Snippe payment session
    const requestBody = {
      amount: amountInCents,
      currency: 'TZS', // Snippe uses TZS (Tanzanian Shilling)
      allowed_methods: ['mobile_money', 'card', 'qr'],
      customer: {
        name: user.name || 'Customer',
        email: user.email,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
      webhook_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/snippe`,
      description: `${pkg.name} - Bot Deployment`,
      metadata: {
        userId: user.id,
        package: packageType,
        email: user.email
      },
      expires_in: 3600
    };

    console.log('Snippe API request:', {
      url: `${SNIPPE_API_URL}/v1/sessions`,
      body: requestBody
    });

    const snippeResponse = await fetch(`${SNIPPE_API_URL}/v1/sessions`, {
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
        sessionId: snippeData.data.id,
        reference: snippeData.data.reference,
        amount: amountInCents,
        currency: 'TZS',
        package: packageType,
        status: 'pending',
        checkoutUrl: snippeData.data.checkout_url,
        metadata: {
          reference: snippeData.data.reference,
          shortCode: snippeData.data.short_code
        }
      }
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: snippeData.data.checkout_url,
      sessionId: snippeData.data.id,
      reference: snippeData.data.reference
    });
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
