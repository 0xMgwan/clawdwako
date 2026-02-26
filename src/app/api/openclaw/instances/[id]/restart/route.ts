import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { restartOpenClawInstance } from '@/lib/openclaw-deploy';

export async function POST(
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

    // Restart the Railway service
    await restartOpenClawInstance(
      instance.railwayProjectId,
      instance.railwayServiceId
    );

    // Update instance status
    await prisma.openClawInstance.update({
      where: { id },
      data: {
        status: 'deploying',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Instance restarting...'
    });

  } catch (error: any) {
    console.error('❌ Failed to restart instance:', error);
    
    return NextResponse.json({ 
      error: 'Failed to restart instance',
      message: error.message 
    }, { status: 500 });
  }
}
