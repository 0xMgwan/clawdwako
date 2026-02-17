import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
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

    const { status } = await request.json();
    const params = await context.params;
    const botId = params.id;

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

    console.log('Updating bot:', botId, 'to status:', status);

    // Update the bot (now verified to belong to the user)
    const bot = await prisma.bot.update({
      where: { id: botId },
      data: { status }
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
  context: { params: Promise<{ id: string }> }
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
    const botId = params.id;

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
