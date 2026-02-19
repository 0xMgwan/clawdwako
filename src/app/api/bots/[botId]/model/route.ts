import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getRailwayClient } from '@/lib/railway';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const botId = params.botId;
    const { selectedModel } = await request.json();

    if (!selectedModel) {
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    // Get bot and verify ownership
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { user: true }
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (bot.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update bot model in database
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: { selectedModel }
    });

    // Update Railway environment variable if bot is deployed on Railway
    if (bot.railwayProjectId && bot.railwayServiceId) {
      try {
        const railwayClient = getRailwayClient();
        await railwayClient.setEnvironmentVariables(
          bot.railwayProjectId,
          bot.railwayServiceId,
          { SELECTED_MODEL: selectedModel }
        );
        console.log('✅ Updated SELECTED_MODEL in Railway');

        // Trigger redeploy by updating a dummy env var
        await railwayClient.setEnvironmentVariables(
          bot.railwayProjectId,
          bot.railwayServiceId,
          { LAST_MODEL_UPDATE: new Date().toISOString() }
        );
        console.log('✅ Triggered Railway redeploy');
      } catch (error: any) {
        console.error('Failed to update Railway:', error.message);
        // Continue even if Railway update fails
      }
    }

    return NextResponse.json({
      success: true,
      bot: updatedBot,
      message: 'Model updated successfully. Bot will use new model for future messages.'
    });
  } catch (error: any) {
    console.error('Error updating bot model:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update model' },
      { status: 500 }
    );
  }
}
