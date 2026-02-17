import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const params = await context.params;
    const botId = params.botId;
    const update = await request.json();

    console.log('🔔 Webhook received for bot:', botId);
    console.log('📨 Update:', JSON.stringify(update, null, 2));
    console.log('🔑 Available API keys:', {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_AI_API_KEY
    });

    // Get bot from database
    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Only respond if bot is running
    if (bot.status !== 'running') {
      console.log('Bot is not running, ignoring message');
      return NextResponse.json({ ok: true });
    }

    // Extract message
    const message = update.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const userMessage = message.text;

    console.log('Processing message:', userMessage);

    // Generate AI response based on selected model
    let aiResponse = '';
    
    // Test mode: If no API keys are configured, return a test response
    const hasApiKeys = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    
    if (!hasApiKeys) {
      aiResponse = `🤖 Test Mode Response\n\nYou said: "${userMessage}"\n\nThis is a test response. The bot is working! Add API keys to enable AI responses.`;
    } else if (bot.selectedModel.includes('claude')) {
      // Use Anthropic API
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: userMessage }]
        });

        aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';
      } catch (error: any) {
        console.error('Anthropic API error:', error.message);
        aiResponse = `I received your message: "${userMessage}"\n\nNote: The Anthropic API is currently unavailable. Please add API credits or use a different model.`;
      }
    } else if (bot.selectedModel.includes('gpt')) {
      // Use OpenAI API
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: userMessage }]
      });

      aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } else if (bot.selectedModel.includes('gemini')) {
      // Use Google Generative AI SDK
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent(userMessage);
      const response = await result.response;
      aiResponse = response.text() || 'Sorry, I could not generate a response.';
    }

    // Send response back to Telegram
    await fetch(`https://api.telegram.org/bot${bot.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiResponse
      })
    });

    console.log('Response sent:', aiResponse.substring(0, 100));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
