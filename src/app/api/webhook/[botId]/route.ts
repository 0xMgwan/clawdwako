import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ botId: string }> }
) {
  try {
    const params = await context.params;
    const botId = params.botId;
    const update = await request.json();

    console.log('Webhook received for bot:', botId);
    console.log('Update:', JSON.stringify(update, null, 2));

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
    
    if (bot.selectedModel.includes('claude')) {
      // Use Anthropic API
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: userMessage }]
      });

      aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';
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
      // Use Google AI API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }]
          })
        }
      );

      const data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
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
