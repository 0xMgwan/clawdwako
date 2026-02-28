import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-CC-Webhook-Signature');
    const body = await request.text();

    // Verify webhook signature
    const WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;
    if (WEBHOOK_SECRET && signature) {
      const computedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (computedSignature !== signature) {
        console.error('Invalid Coinbase webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log('Coinbase webhook event:', event.event?.type, event.event?.data?.code);

    // Handle charge confirmed event
    if (event.event?.type === 'charge:confirmed') {
      const chargeCode = event.event.data.code;
      const chargeId = event.event.data.id;

      // Update payment status in database
      const payment = await prisma.payment.findFirst({
        where: { 
          OR: [
            { reference: chargeCode },
            { sessionId: chargeId }
          ]
        }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'completed',
            completedAt: new Date()
          }
        });

        console.log(`Crypto payment ${chargeCode} confirmed and marked as completed`);

        // Note: Bot deployment will be triggered by the payment-success page
        // when the user is redirected back after payment
      } else {
        console.error(`Payment not found for charge: ${chargeCode}`);
      }
    }

    // Handle charge failed event
    if (event.event?.type === 'charge:failed') {
      const chargeCode = event.event.data.code;
      const chargeId = event.event.data.id;

      const payment = await prisma.payment.findFirst({
        where: { 
          OR: [
            { reference: chargeCode },
            { sessionId: chargeId }
          ]
        }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'failed' }
        });

        console.log(`Crypto payment ${chargeCode} failed`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Coinbase webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
