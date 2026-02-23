import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const params = await context.params;
    const botId = params.botId;

    console.log('📊 Fetching stats for bot:', botId);

    // Get message count
    const messageCount = await prisma.activityLog.count({
      where: {
        botId,
        type: 'message'
      }
    });

    // Get unique users count from metadata
    const messageLogs = await prisma.activityLog.findMany({
      where: {
        botId,
        type: 'message'
      },
      select: {
        metadata: true
      }
    });

    const uniqueUsers = new Set(
      messageLogs
        .map(log => (log.metadata as any)?.userId)
        .filter(userId => userId && userId !== 'unknown')
    ).size;

    console.log(`✅ Stats for bot ${botId}:`, {
      messages: messageCount,
      users: uniqueUsers
    });

    return NextResponse.json({
      success: true,
      stats: {
        messages: messageCount,
        users: uniqueUsers
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
