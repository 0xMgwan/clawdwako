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

    const { packageType, phoneNumber, paymentMethod, provider, botConfig, cardDetails } = await request.json();

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
    const amountInTZS = pkg.amount * 2500; // Convert USD to TZS (1 USD = 2,500 TZS)

    console.log('Creating Snippe payment session:', {
      package: packageType,
      amountUSD: pkg.amount,
      amountTZS: amountInTZS,
      currency: 'TZS'
    });

    // Validate phone number for mobile money
    if (paymentMethod === 'mobile' && !phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required for mobile money payments' }, { status: 400 });
    }

    // Create Snippe payment - different format for card vs mobile
    const nameParts = (user.name || 'Customer Name').split(' ');
    
    // Use WEBHOOK_URL (ngrok HTTPS) for webhooks, NEXT_PUBLIC_URL for redirects
    // Snippe requires HTTPS for webhooks
    const webhookBaseUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_URL || 'https://clawdwako.xyz';
    const redirectBaseUrl = process.env.NEXT_PUBLIC_URL || process.env.WEBHOOK_URL || 'https://clawdwako.xyz';

    let requestBody: any;

    // Handle Crypto payments (Coinbase Commerce)
    if (paymentMethod === 'crypto') {
      const COINBASE_API_KEY = process.env.COINBASE_COMMERCE_API_KEY;
      if (!COINBASE_API_KEY) {
        return NextResponse.json({ error: 'Coinbase Commerce not configured' }, { status: 500 });
      }

      try {
        // Create Coinbase Commerce charge
        const chargeResponse = await fetch('https://api.commerce.coinbase.com/charges', {
          method: 'POST',
          headers: {
            'X-CC-Api-Key': COINBASE_API_KEY,
            'Content-Type': 'application/json',
            'X-CC-Version': '2018-03-22'
          },
          body: JSON.stringify({
            name: `${pkg.name} - AI Bot Deployment`,
            description: 'Telegram AI Bot Deployment on Railway',
            pricing_type: 'fixed_price',
            local_price: {
              amount: pkg.amount.toString(),
              currency: 'USD'
            },
            redirect_url: `${webhookBaseUrl}/payment-success`,
            cancel_url: `${webhookBaseUrl}?payment=cancelled`,
            metadata: {
              userId: user.id,
              package: packageType,
              email: user.email,
              paymentMethod: 'crypto',
              botConfig: JSON.stringify(botConfig || {})
            }
          })
        });

        if (!chargeResponse.ok) {
          const errorText = await chargeResponse.text();
          console.error('Coinbase Commerce API error:', errorText);
          return NextResponse.json({ error: 'Failed to create crypto payment' }, { status: 500 });
        }

        const chargeData = await chargeResponse.json();
        console.log('Coinbase charge created:', chargeData.data.code);

        // Store payment in database
        await prisma.payment.create({
          data: {
            userId: user.id,
            sessionId: chargeData.data.id,
            reference: chargeData.data.code,
            amount: pkg.amount,
            currency: 'USD',
            package: packageType,
            status: 'pending',
            checkoutUrl: chargeData.data.hosted_url,
            metadata: {
              coinbase: chargeData.data,
              botConfig: botConfig || null
            }
          }
        });

        return NextResponse.json({
          success: true,
          paymentMethod: 'crypto',
          message: 'Redirecting to Coinbase Commerce...',
          checkoutUrl: chargeData.data.hosted_url,
          sessionId: chargeData.data.id,
          reference: chargeData.data.code,
          status: 'pending'
        });
      } catch (error: any) {
        console.error('Coinbase Commerce error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    if (paymentMethod === 'card') {
      // Card payment format per Snippe docs
      requestBody = {
        payment_type: 'card',
        details: {
          amount: amountInTZS,
          currency: 'TZS',
          redirect_url: `${redirectBaseUrl}/payment-success`,
          cancel_url: `${redirectBaseUrl}?payment=cancelled`
        },
        phone_number: phoneNumber || '255700000000',
        customer: {
          firstname: nameParts[0] || 'Customer',
          lastname: nameParts[1] || 'Name',
          email: user.email || 'customer@example.com',
          address: 'Masaki Peninsula',
          city: 'Dar es Salaam',
          state: 'Dar es Salaam',
          postcode: '14111',
          country: 'TZ'
        },
        webhook_url: `${webhookBaseUrl}/api/webhooks/snippe`,
        metadata: {
          userId: user.id,
          package: packageType,
          email: user.email,
          paymentMethod: 'card'
        }
      };
    } else {
      // Mobile money format
      requestBody = {
        phone_number: phoneNumber || '+255000000000',
        details: {
          amount: amountInTZS,
          currency: 'TZS',
          description: `${pkg.name} - Bot Deployment`
        },
        customer: {
          firstname: nameParts[0] || 'Customer',
          lastname: nameParts[1] || 'Name',
          email: user.email
        },
        callback_url: `${webhookBaseUrl}/api/webhooks/snippe`,
        metadata: {
          userId: user.id,
          package: packageType,
          email: user.email,
          paymentMethod: paymentMethod,
          provider: provider
        }
      };
    }

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

    // Store payment in database (include botConfig for auto-deploy after payment)
    await prisma.payment.create({
      data: {
        userId: user.id,
        sessionId: snippeData.data?.id || snippeData.data?.reference,
        reference: snippeData.data?.reference,
        amount: amountInTZS,
        currency: 'TZS',
        package: packageType,
        status: 'pending',
        checkoutUrl: snippeData.data?.payment_url || snippeData.data?.checkout_url,
        metadata: {
          ...(snippeData.data || {}),
          botConfig: botConfig || null
        }
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
