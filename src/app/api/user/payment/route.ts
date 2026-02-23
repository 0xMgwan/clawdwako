import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find user's most recent completed payment
    const payment = await prisma.payment.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    if (!payment) {
      // No payment found, return default
      return NextResponse.json({ 
        package: null,
        message: 'No active subscription found' 
      });
    }

    return NextResponse.json({
      package: payment.package,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt,
    });
  } catch (error) {
    console.error('Error fetching user payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment information' },
      { status: 500 }
    );
  }
}
