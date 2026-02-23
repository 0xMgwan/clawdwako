import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const SNIPPE_WEBHOOK_SECRET = process.env.SNIPPE_WEBHOOK_SECRET;

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('X-Webhook-Signature');
    const rawBody = await request.text();
    
    // Verify webhook signature
    if (SNIPPE_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, SNIPPE_WEBHOOK_SECRET);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    
    console.log('Snippe webhook received:', event.type);

    // Handle payment.completed event
    if (event.type === 'payment.completed') {
      const { reference, metadata, amount, status } = event.data;
      
      // Find payment by session reference
      const payment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['reference'],
            equals: reference
          }
        }
      });

      if (!payment) {
        console.error('Payment not found for reference:', reference);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          reference: reference,
          completedAt: new Date(),
          metadata: {
            ...(payment.metadata as object || {}),
            ...event.data
          }
        }
      });

      console.log('Payment completed:', payment.id);
    }

    // Handle payment.failed event
    if (event.type === 'payment.failed') {
      const { reference, failure_reason } = event.data;
      
      const payment = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['reference'],
            equals: reference
          }
        }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'failed',
            metadata: {
              ...(payment.metadata as object || {}),
              failure_reason,
              ...event.data
            }
          }
        });

        console.log('Payment failed:', payment.id, failure_reason);
      }
    }

    // Respond quickly to Snippe
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
