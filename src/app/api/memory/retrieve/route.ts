import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Retrieve agent memories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const chatId = searchParams.get('chatId');

    if (!botId || !chatId) {
      return NextResponse.json({ error: 'botId and chatId required' }, { status: 400 });
    }

    const memories = await prisma.agentMemory.findMany({
      where: {
        botId,
        chatId
      },
      orderBy: {
        importance: 'desc'
      }
    });

    // Update access time and count
    for (const memory of memories) {
      await prisma.agentMemory.update({
        where: { id: memory.id },
        data: {
          lastAccessed: new Date(),
          accessCount: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ success: true, memories });
  } catch (error: any) {
    console.error('Error retrieving memories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
