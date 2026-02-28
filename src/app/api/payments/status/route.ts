import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

const SNIPPE_API_KEY = process.env.SNIPPE_API_KEY;
const SNIPPE_API_URL = 'https://api.snippe.sh';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    // Find payment by reference or sessionId
    let payment = await prisma.payment.findFirst({
      where: { reference: reference }
    });

    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { sessionId: reference }
      });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If payment is still pending, poll Snippe API directly for real-time status
    if (payment.status === 'pending' && SNIPPE_API_KEY) {
      try {
        const snippeRef = payment.reference || payment.sessionId;
        if (snippeRef) {
          const snippeResponse = await fetch(`${SNIPPE_API_URL}/v1/payments/${snippeRef}`, {
            headers: {
              'Authorization': `Bearer ${SNIPPE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });

          if (snippeResponse.ok) {
            const snippeData = await snippeResponse.json();
            const snippeStatus = snippeData.data?.status || snippeData.status;
            
            console.log('Snippe payment status check:', { ref: snippeRef, status: snippeStatus, data: snippeData });

            // Map Snippe status to our status
            let mappedStatus = 'pending';
            if (snippeStatus === 'completed' || snippeStatus === 'successful' || snippeStatus === 'success' || snippeStatus === 'paid') {
              mappedStatus = 'completed';
            } else if (snippeStatus === 'failed' || snippeStatus === 'cancelled' || snippeStatus === 'expired') {
              mappedStatus = 'failed';
            }

            // Update DB if status changed
            if (mappedStatus !== 'pending') {
              payment = await prisma.payment.update({
                where: { id: payment.id },
                data: {
                  status: mappedStatus,
                  completedAt: mappedStatus === 'completed' ? new Date() : undefined,
                  metadata: {
                    ...(payment.metadata as object || {}),
                    snippeStatus: snippeData.data || snippeData
                  }
                }
              });
            }
          } else {
            console.log('Snippe status check failed:', snippeResponse.status);
          }
        }
      } catch (snippeError) {
        console.error('Error polling Snippe API:', snippeError);
        // Don't fail the request, just return DB status
      }
    }

    return NextResponse.json({
      status: payment.status,
      reference: payment.reference,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt
    });
  } catch (error: any) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
