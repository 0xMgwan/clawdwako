import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramBotToken } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Bot token is required' },
        { status: 400 }
      );
    }

    // Verify the bot token with Telegram
    const result = await verifyTelegramBotToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: result.error 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      botInfo: result.botInfo,
    });
  } catch (error: any) {
    console.error('Error verifying Telegram bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
