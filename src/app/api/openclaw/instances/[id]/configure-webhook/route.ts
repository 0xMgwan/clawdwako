import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get instance
    const instance = await prisma.openClawInstance.findUnique({
      where: { id }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Verify ownership
    if (instance.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get deployment URL from Railway
    const { getRailwayClient } = await import('@/lib/railway');
    const railwayClient = getRailwayClient();
    
    const status = await railwayClient.getDeploymentStatus(
      instance.railwayProjectId,
      instance.railwayServiceId
    );

    if (!status.url) {
      return NextResponse.json({ 
        error: 'Deployment URL not available yet',
        message: 'Railway is still building. Please wait a few minutes.'
      }, { status: 400 });
    }

    // Configure Telegram webhook
    if (instance.channel === 'telegram' && instance.telegramToken) {
      const webhookUrl = `${status.url}/telegram/webhook`;
      
      try {
        const response = await axios.post(
          `https://api.telegram.org/bot${instance.telegramToken}/setWebhook`,
          {
            url: webhookUrl,
            allowed_updates: ['message', 'callback_query', 'inline_query'],
          }
        );
        
        if (!response.data.ok) {
          throw new Error(`Telegram webhook setup failed: ${response.data.description}`);
        }

        // Update instance with deployment URL
        await prisma.openClawInstance.update({
          where: { id },
          data: {
            deploymentUrl: status.url,
            status: 'active',
            lastHealthCheck: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          message: 'Webhook configured successfully',
          webhookUrl,
          deploymentUrl: status.url
        });

      } catch (error: any) {
        console.error('❌ Failed to configure webhook:', error);
        return NextResponse.json({ 
          error: 'Webhook configuration failed',
          message: error.message 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      error: 'Invalid channel',
      message: 'Only Telegram webhooks are supported currently'
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Failed to configure webhook:', error);
    
    return NextResponse.json({ 
      error: 'Failed to configure webhook',
      message: error.message 
    }, { status: 500 });
  }
}
