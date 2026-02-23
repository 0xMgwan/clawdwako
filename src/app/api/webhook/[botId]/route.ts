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

    // Log webhook event
    await prisma.activityLog.create({
      data: {
        botId,
        type: 'webhook',
        content: 'Webhook received from Telegram',
        metadata: { 
          chatId: update.message?.chat?.id?.toString() || 'unknown',
          updateId: update.update_id 
        }
      }
    });

    // Get bot from database
    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    });

    if (!bot) {
      console.log('❌ Bot not found in database:', botId);
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    console.log('✅ Bot found in database:', {
      id: bot.id,
      name: bot.name,
      model: bot.selectedModel,
      hasAnthropicKey: !!bot.anthropicApiKey,
      hasOpenAIKey: !!bot.openaiApiKey,
      hasGoogleKey: !!bot.googleApiKey,
      anthropicKeyPreview: bot.anthropicApiKey ? `${bot.anthropicApiKey.substring(0, 10)}...` : 'NONE',
      openaiKeyPreview: bot.openaiApiKey ? `${bot.openaiApiKey.substring(0, 10)}...` : 'NONE',
      googleKeyPreview: bot.googleApiKey ? `${bot.googleApiKey.substring(0, 10)}...` : 'NONE',
    });

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

    // Log user message
    await prisma.activityLog.create({
      data: {
        botId,
        type: 'message',
        content: `User message: "${userMessage}"`,
        metadata: {
          userId: message.from?.id?.toString() || 'unknown',
          messageId: message.message_id?.toString() || 'unknown',
          chatId: chatId.toString()
        }
      }
    });

    // Generate AI response based on selected model
    let aiResponse = '';
    
    // Use user's API key if available, otherwise fall back to platform key
    const anthropicKey = bot.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    const openaiKey = bot.openaiApiKey || process.env.OPENAI_API_KEY;
    const googleKey = bot.googleApiKey || process.env.GOOGLE_AI_API_KEY;
    
    console.log('🔑 API Keys being used:', {
      model: bot.selectedModel,
      anthropicKey: anthropicKey ? `${anthropicKey.substring(0, 10)}...` : 'NONE',
      openaiKey: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'NONE',
      googleKey: googleKey ? `${googleKey.substring(0, 10)}...` : 'NONE',
    });
    
    // Test mode: If no API keys are configured, return a test response
    const hasApiKeys = anthropicKey || openaiKey || googleKey;
    
    if (!hasApiKeys) {
      aiResponse = `🤖 Test Mode Response\n\nYou said: "${userMessage}"\n\nThis is a test response. The bot is working! Add API keys to enable AI responses.`;
    } else if (bot.selectedModel.includes('claude')) {
      // Use Anthropic API
      try {
        const anthropic = new Anthropic({
          apiKey: anthropicKey
        });

        const response = await anthropic.messages.create({
          model: bot.selectedModel,
          max_tokens: 1024,
          messages: [{ role: 'user', content: userMessage }]
        });

        aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';
        
        // Log successful API call
        await prisma.activityLog.create({
          data: {
            botId,
            type: 'api_call',
            content: `${bot.selectedModel} API call successful`,
            metadata: {
              model: bot.selectedModel,
              inputTokens: response.usage.input_tokens,
              outputTokens: response.usage.output_tokens
            }
          }
        });
      } catch (error: any) {
        console.error('Anthropic API error:', error.message);
        aiResponse = `I received your message: "${userMessage}"\n\nNote: The Anthropic API is currently unavailable. Please add API credits or use a different model.`;
      }
    } else if (bot.selectedModel.includes('gpt')) {
      // Use OpenAI API
      try {
        const openai = new OpenAI({
          apiKey: openaiKey
        });

        const response = await openai.chat.completions.create({
          model: bot.selectedModel,
          messages: [
            { 
              role: 'system', 
              content: `You are a helpful AI assistant powered by ${bot.selectedModel}. Be concise, friendly, and helpful.`
            },
            { role: 'user', content: userMessage }
          ]
        });

        aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
        
        // Log successful API call
        await prisma.activityLog.create({
          data: {
            botId,
            type: 'api_call',
            content: `${bot.selectedModel} API call successful`,
            metadata: {
              model: bot.selectedModel,
              inputTokens: response.usage?.prompt_tokens || 0,
              outputTokens: response.usage?.completion_tokens || 0
            }
          }
        });
      } catch (error: any) {
        console.error('❌ OpenAI API error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        
        // Log API error
        await prisma.activityLog.create({
          data: {
            botId,
            type: 'error',
            content: `OpenAI API error: ${error.message}`,
            metadata: {
              model: bot.selectedModel,
              errorType: error.type || 'unknown'
            }
          }
        });
        
        aiResponse = `I received your message: "${userMessage}"\n\nNote: The OpenAI API is currently unavailable. Please add API credits or use a different model.`;
      }
    } else if (bot.selectedModel.includes('gemini')) {
      // Use Google Generative AI SDK
      try {
        const genAI = new GoogleGenerativeAI(googleKey || '');
        const model = genAI.getGenerativeModel({ model: bot.selectedModel });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        aiResponse = response.text() || 'Sorry, I could not generate a response.';
      } catch (error: any) {
        console.error('Google AI API error:', error.message);
        aiResponse = `I received your message: "${userMessage}"\n\nNote: The Google AI API is currently unavailable. Please add API credits or use a different model.`;
      }
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
