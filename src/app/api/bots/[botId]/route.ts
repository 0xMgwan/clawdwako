import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const params = await context.params;
    const botId = params.botId;

    console.log('🔍 Fetching bot configuration for botId:', botId);

    // Fetch bot from database
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        telegramBotToken: true,
        selectedModel: true,
        anthropicApiKey: true,
        openaiApiKey: true,
        googleApiKey: true,
        status: true,
        name: true,
      }
    });

    if (!bot) {
      console.log('❌ Bot not found:', botId);
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    console.log('✅ Bot configuration found:', {
      id: bot.id,
      name: bot.name,
      model: bot.selectedModel,
      hasToken: !!bot.telegramBotToken,
      hasAnthropicKey: !!bot.anthropicApiKey,
      hasOpenAIKey: !!bot.openaiApiKey,
      hasGoogleKey: !!bot.googleApiKey
    });

    return NextResponse.json({
      success: true,
      bot
    });
  } catch (error: any) {
    console.error('❌ Error fetching bot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const params = await context.params;
    const botId = params.botId;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the bot belongs to this user
    const existingBot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true }
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    if (existingBot.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this bot' },
        { status: 403 }
      );
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.selectedModel !== undefined) updateData.selectedModel = body.selectedModel;

    console.log('Updating bot:', botId, 'with data:', updateData);

    // Update the bot (now verified to belong to the user)
    const bot = await prisma.bot.update({
      where: { id: botId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      bot
    });
  } catch (error: any) {
    console.error('Error updating bot:', error);
    return NextResponse.json(
      { error: 'Failed to update bot', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const botId = params.botId;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify the bot belongs to this user
    const existingBot = await prisma.bot.findUnique({
      where: { id: botId },
      select: { userId: true }
    });

    if (!existingBot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    if (existingBot.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this bot' },
        { status: 403 }
      );
    }

    console.log('Deleting bot:', botId);

    // Delete the bot (now verified to belong to the user)
    await prisma.bot.delete({
      where: { id: botId }
    });

    return NextResponse.json({
      success: true,
      message: 'Bot deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting bot:', error);
    return NextResponse.json(
      { error: 'Failed to delete bot', details: error.message },
      { status: 500 }
    );
  }
}
