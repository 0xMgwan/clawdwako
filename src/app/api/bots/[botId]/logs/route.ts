import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const params = await context.params;
    const botId = params.botId;

    console.log('📊 Fetching activity logs for bot:', botId);

    // Fetch last 50 activity logs for this bot
    const logs = await prisma.activityLog.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log(`✅ Found ${logs.length} activity logs`);

    // Transform to match frontend format
    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      type: log.type,
      content: log.content,
      metadata: log.metadata
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs
    });
  } catch (error: any) {
    console.error('❌ Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error.message },
      { status: 500 }
    );
  }
}
