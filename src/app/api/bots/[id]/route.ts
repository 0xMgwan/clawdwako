import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { status } = await request.json();
    const params = await context.params;
    const botId = params.id;

    console.log('Updating bot:', botId, 'to status:', status);

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
    const params = await context.params;
    const botId = params.id;

    console.log('Deleting bot:', botId);

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
