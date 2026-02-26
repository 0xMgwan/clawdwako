import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Save a conversation message
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const message = await prisma.conversationMessage.create({
      data: {
        botId: data.botId,
        chatId: data.chatId,
        role: data.role,
        content: data.content,
        toolCalls: data.toolCalls || null,
        toolResults: data.toolResults || null,
        model: data.model || '',
        tokenCount: data.tokenCount || 0
      }
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error('Error saving message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const chatId = searchParams.get('chatId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!botId || !chatId) {
      return NextResponse.json({ error: 'botId and chatId required' }, { status: 400 });
    }

    const messages = await prisma.conversationMessage.findMany({
      where: {
        botId,
        chatId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    // Reverse to get chronological order
    messages.reverse();

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error loading messages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
