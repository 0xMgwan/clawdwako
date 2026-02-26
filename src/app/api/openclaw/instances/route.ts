import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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
        apiCalls: true,
        messageCount: true,
        uptime: true,
        lastActive: true,
        lastHealthCheck: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      instances
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch instances:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch instances',
      message: error.message 
    }, { status: 500 });
  }
}
