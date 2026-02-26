import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getRailwayClient } from '@/lib/railway';

export async function GET(request: NextRequest) {
  try {
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

    // Get all instances for this user
    const instances = await prisma.openClawInstance.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        model: true,
        channel: true,
        status: true,
        deploymentUrl: true,
        railwayProjectId: true,
        railwayServiceId: true,
        apiCalls: true,
        messageCount: true,
        uptime: true,
        lastActive: true,
        lastHealthCheck: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Fetch real message counts from Railway logs for each instance
    const railwayClient = getRailwayClient();
    const instancesWithCounts = await Promise.all(
      instances.map(async (instance) => {
        let messageCount = 0;
        
        try {
          // Get logs from Railway
          const logs = await railwayClient.getLogs(
            instance.railwayProjectId,
            instance.railwayServiceId,
            100
          );
          
          // Count messages (look for telegram activity in logs)
          messageCount = logs.filter((log: any) => {
            const msg = log.message || '';
            return msg.includes('[telegram]') || 
                   msg.includes('telegram') ||
                   msg.includes('message') ||
                   msg.includes('user:');
          }).length;
        } catch (error) {
          console.error(`Failed to fetch logs for instance ${instance.id}:`, error);
          // Keep messageCount as 0 on error
        }

        return {
          ...instance,
          messageCount,
          // Remove Railway IDs from response for security
          railwayProjectId: undefined,
          railwayServiceId: undefined
        };
      })
    );

    return NextResponse.json({
      success: true,
      instances: instancesWithCounts
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch instances:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch instances',
      message: error.message 
    }, { status: 500 });
  }
}
