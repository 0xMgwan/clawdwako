import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Save a long-term memory
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Upsert memory (update if exists, create if not)
    const memory = await prisma.agentMemory.upsert({
      where: {
        botId_chatId_key: {
          botId: data.botId,
          chatId: data.chatId,
          key: data.key
        }
      },
      update: {
        value: data.value,
        importance: data.importance || 5,
        metadata: data.metadata || null,
        lastAccessed: new Date(),
        accessCount: {
          increment: 1
        }
      },
      create: {
        botId: data.botId,
        chatId: data.chatId,
        memoryType: data.memoryType,
        key: data.key,
        value: data.value,
        importance: data.importance || 5,
        metadata: data.metadata || null
      }
    });

    return NextResponse.json({ success: true, memory });
  } catch (error: any) {
    console.error('Error saving memory:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
