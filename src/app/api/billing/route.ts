import { NextRequest, NextResponse } from 'next/server';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    agents: number;
    messages: number;
    users: number;
  };
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    features: ['1 AI Agent', 'Basic templates', 'Community support'],
    limits: { agents: 1, messages: 1000, users: 10 }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    features: ['5 AI Agents', 'Premium templates', 'Priority support', 'Custom integrations'],
    limits: { agents: 5, messages: 10000, users: 100 }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 60,
    features: ['Unlimited agents', 'Custom templates', '24/7 support', 'Dedicated infrastructure'],
    limits: { agents: -1, messages: -1, users: -1 }
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');

  if (action === 'plans') {
    return NextResponse.json({ plans: subscriptionPlans });
  }

  if (userId) {
    // Get user's current subscription
    // In a real implementation, fetch from database
    const mockSubscription = {
      id: 'sub-123',
      userId,
      planId: 'pro',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usage: {
        agents: 2,
        messages: 3456,
        users: 45
      },
      nextBillingAmount: 30,
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa'
      }
    };

    return NextResponse.json({ subscription: mockSubscription });
  }

  return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, planId, paymentMethodId } = await request.json();

    if (action === 'subscribe') {
      // Create new subscription
      // In a real implementation, integrate with Stripe
      const subscription = {
        id: `sub-${Date.now()}`,
        userId,
        planId,
        status: 'active',
        createdAt: new Date().toISOString(),
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      return NextResponse.json({
        success: true,
        subscription,
        message: 'Subscription created successfully'
      });
    }

    if (action === 'upgrade') {
      // Upgrade subscription
      const updatedSubscription = {
        id: `sub-${userId}`,
        userId,
        planId,
        status: 'active',
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
        message: 'Subscription upgraded successfully'
      });
    }

    if (action === 'cancel') {
      // Cancel subscription
      return NextResponse.json({
        success: true,
        message: 'Subscription will be canceled at the end of the current billing period'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Billing error:', error);
    return NextResponse.json(
      { error: 'Failed to process billing request' },
      { status: 500 }
    );
  }
}
