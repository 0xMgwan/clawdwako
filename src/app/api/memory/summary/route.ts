import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Create conversation summary
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const summary = await prisma.conversationSummary.create({
      data: {
        botId: data.botId,
        chatId: data.chatId,
        summary: data.summary || 'Conversation summary',
        messageCount: data.messageCount || 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        topics: data.topics || null
      }
    });

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('Error creating summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
