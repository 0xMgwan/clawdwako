import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    // Don't expose sensitive keys in response
    const { anthropicKey, openaiKey, googleKey, telegramToken, discordToken, whatsappToken, ...safeInstance } = instance;

    return NextResponse.json({
      success: true,
      instance: safeInstance
    });

  } catch (error: any) {
    console.error('❌ Failed to fetch instance:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch instance',
      message: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { name, model, anthropicKey, openaiKey, googleKey } = body;

    // Update instance in database
    const updatedInstance = await prisma.openClawInstance.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(model && { model }),
        ...(anthropicKey && { anthropicKey }),
        ...(openaiKey && { openaiKey }),
        ...(googleKey && { googleKey }),
        updatedAt: new Date()
      }
    });

    // If model or API keys were updated, update Railway env vars and redeploy
    if (model || anthropicKey || openaiKey || googleKey) {
      try {
        const { getRailwayClient } = await import('@/lib/railway');
        const railwayClient = getRailwayClient();
        
        const envVarsToUpdate: Record<string, string> = {};
        if (model) envVarsToUpdate.MODEL = model;
        if (anthropicKey) envVarsToUpdate.ANTHROPIC_API_KEY = anthropicKey;
        if (openaiKey) envVarsToUpdate.OPENAI_API_KEY = openaiKey;
        if (googleKey) envVarsToUpdate.GOOGLE_API_KEY = googleKey;
        
        await railwayClient.updateEnvVars(
          instance.railwayProjectId,
          instance.railwayServiceId,
          envVarsToUpdate
        );
        
        console.log('✅ Railway env vars updated, triggering redeploy...');
        
        // Trigger redeploy
        await railwayClient.redeployService(
          instance.railwayProjectId,
          instance.railwayServiceId
        );
        
        console.log('✅ Railway redeploy triggered');
      } catch (error: any) {
        console.error('❌ Failed to update Railway:', error.message);
        // Continue - database is updated even if Railway update fails
      }
    }

    return NextResponse.json({
      success: true,
      instance: {
        id: updatedInstance.id,
        name: updatedInstance.name,
        status: updatedInstance.status
      }
    });

  } catch (error: any) {
    console.error('❌ Failed to update instance:', error);
    
    return NextResponse.json({ 
      error: 'Failed to update instance',
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
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

    // TODO: Stop Railway service before deleting
    console.log('🛑 Stopping Railway service:', instance.railwayServiceId);

    // Delete instance from database
    await prisma.openClawInstance.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Instance deleted successfully'
    });

  } catch (error: any) {
    console.error('❌ Failed to delete instance:', error);
    
    return NextResponse.json({ 
      error: 'Failed to delete instance',
      message: error.message 
    }, { status: 500 });
  }
}
