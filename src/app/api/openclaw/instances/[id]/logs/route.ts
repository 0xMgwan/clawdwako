import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getRailwayClient } from '@/lib/railway';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const instance = await prisma.openClawInstance.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // Get real logs from Railway
    const railwayClient = getRailwayClient();
    const rawLogs = await railwayClient.getLogs(
      instance.railwayProjectId,
      instance.railwayServiceId,
      100
    );

    // Parse Railway logs into structured entries
    const formattedLogs = rawLogs.map((log: any, index: number) => {
      const msg = log.message || '';
      let type = 'info';
      
      // Categorize log entries
      if (msg.includes('[telegram]') || msg.includes('telegram')) {
        type = 'message';
      } else if (msg.includes('error') || msg.includes('Error') || msg.includes('❌') || log.severity === 'error') {
        type = 'error';
      } else if (msg.includes('[gateway]') || msg.includes('listening') || msg.includes('started')) {
        type = 'gateway';
      } else if (msg.includes('API') || msg.includes('api') || msg.includes('model')) {
        type = 'api_call';
      } else if (msg.includes('Config') || msg.includes('config')) {
        type = 'config';
      }

      return {
        id: `log-${index}-${Date.now()}`,
        timestamp: log.timestamp || new Date().toISOString(),
        type,
        content: msg,
        metadata: {
          severity: log.severity || 'info',
          source: 'railway'
        }
      };
    });

    return NextResponse.json({
      success: true,
      logs: formattedLogs
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch logs:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch logs',
      message: error.message 
    }, { status: 500 });
  }
}
