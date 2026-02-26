import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getOpenClawLogs } from '@/lib/openclaw-deploy';

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

    // Get logs from Railway
    const logs = await getOpenClawLogs(
      instance.railwayProjectId,
      instance.railwayServiceId,
      100
    );

    return NextResponse.json({
      success: true,
      logs
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch logs:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch logs',
      message: error.message 
    }, { status: 500 });
  }
}
