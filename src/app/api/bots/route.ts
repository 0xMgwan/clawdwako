import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // For now, fetch all bots (later add user authentication)
    const bots = await prisma.bot.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        telegramBotUsername: true,
        selectedModel: true,
        status: true,
        createdAt: true,
        deployedAt: true,
        railwayProjectId: true,
        railwayServiceId: true,
      }
    });

    return NextResponse.json({
      success: true,
      bots: bots
    });
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bots', details: error.message },
      { status: 500 }
    );
  }
}
