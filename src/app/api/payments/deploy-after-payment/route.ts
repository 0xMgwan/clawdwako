import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getRailwayClient } from '@/lib/railway';

// Platform API keys - used when users pay instead of providing their own keys
const PLATFORM_ANTHROPIC_API_KEY = process.env.PLATFORM_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
const PLATFORM_OPENAI_API_KEY = process.env.PLATFORM_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const PLATFORM_GOOGLE_API_KEY = process.env.PLATFORM_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
const SNIPPE_API_KEY = process.env.SNIPPE_API_KEY;
const SNIPPE_API_URL = 'https://api.snippe.sh';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentReference } = await request.json();
    console.log('🚀 deploy-after-payment called with reference:', paymentReference);

    if (!paymentReference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    // Find the payment
    let payment = await prisma.payment.findFirst({
      where: { reference: paymentReference }
    });

    if (!payment) {
      payment = await prisma.payment.findFirst({
        where: { sessionId: paymentReference }
      });
    }

    if (!payment) {
      console.error('Payment not found for reference:', paymentReference);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    console.log('Found payment:', { id: payment.id, status: payment.status, ref: payment.reference });

    // Check if already deployed
    const existingMetadata = payment.metadata as any;
    if (existingMetadata?.deployed) {
      console.log('Payment already deployed, skipping');
      return NextResponse.json({ success: true, message: 'Already deployed', alreadyDeployed: true });
    }

    // If payment not yet completed in DB, verify with Snippe API directly
    if (payment.status !== 'completed' && SNIPPE_API_KEY) {
      console.log('Payment not completed in DB, checking Snippe API...');
      const snippeRef = payment.reference || payment.sessionId;
      if (snippeRef) {
        try {
          const snippeResponse = await fetch(`${SNIPPE_API_URL}/v1/payments/${snippeRef}`, {
            headers: {
              'Authorization': `Bearer ${SNIPPE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          if (snippeResponse.ok) {
            const snippeData = await snippeResponse.json();
            const snippeStatus = snippeData.data?.status;
            console.log('Snippe API status:', snippeStatus);
            
            if (snippeStatus === 'completed' || snippeStatus === 'successful' || snippeStatus === 'success' || snippeStatus === 'paid') {
              // Update DB
              payment = await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'completed', completedAt: new Date() }
              });
              console.log('✅ Payment marked completed from Snippe API');
            } else {
              console.log('Payment still not completed on Snippe:', snippeStatus);
              return NextResponse.json({ error: `Payment status: ${snippeStatus}` }, { status: 400 });
            }
          }
        } catch (e: any) {
          console.error('Snippe check failed:', e.message);
        }
      }
    }

    if (payment.status !== 'completed') {
      console.error('Payment not completed:', payment.status);
      return NextResponse.json({ error: 'Payment not yet completed' }, { status: 400 });
    }

    // Get bot config from payment metadata
    const metadata = payment.metadata as any;
    const botConfig = metadata?.botConfig;
    console.log('Bot config from metadata:', botConfig ? { username: botConfig.botUsername, model: botConfig.selectedModel, hasToken: !!botConfig.botToken } : 'NULL');

    if (!botConfig?.botToken || !botConfig?.selectedModel || !botConfig?.botUsername) {
      return NextResponse.json({ 
        error: 'Bot configuration not found in payment. Please deploy manually from the dashboard.',
        missingConfig: true
      }, { status: 400 });
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine which platform API key to use based on selected model
    const selectedModel = botConfig.selectedModel;
    const platformApiKeys = {
      anthropic: selectedModel.includes('claude') ? PLATFORM_ANTHROPIC_API_KEY : '',
      openai: selectedModel.includes('gpt') ? PLATFORM_OPENAI_API_KEY : '',
      google: selectedModel.includes('gemini') ? PLATFORM_GOOGLE_API_KEY : '',
    };

    console.log('🚀 Auto-deploying bot after payment:', {
      botUsername: botConfig.botUsername,
      selectedModel,
      userId: user.id,
      paymentId: payment.id,
      hasAnthropicKey: !!platformApiKeys.anthropic,
      hasOpenaiKey: !!platformApiKeys.openai,
      hasGoogleKey: !!platformApiKeys.google,
    });

    // Check if bot already exists
    let existingBot = await prisma.bot.findFirst({
      where: { telegramBotToken: botConfig.botToken }
    });

    // Deploy to Railway
    let railwayProjectId = null;
    let railwayServiceId = null;

    try {
      const railwayClient = getRailwayClient();
      const railwayDeployment = await railwayClient.deployOpenClaw({
        projectName: `bot-${botConfig.botUsername}`,
        telegramBotToken: botConfig.botToken,
        selectedModel: selectedModel,
        anthropicApiKey: platformApiKeys.anthropic || undefined,
        openaiApiKey: platformApiKeys.openai || undefined,
        googleAiApiKey: platformApiKeys.google || undefined,
        botId: existingBot?.id,
      });

      railwayProjectId = railwayDeployment.projectId;
      railwayServiceId = railwayDeployment.serviceId;

      console.log('✅ Railway deployment successful:', {
        projectId: railwayProjectId,
        serviceId: railwayServiceId,
      });
    } catch (railwayError: any) {
      console.error('❌ Railway deployment failed:', railwayError.message);
    }

    // Create or update bot record
    let bot;
    if (existingBot) {
      bot = await prisma.bot.update({
        where: { id: existingBot.id },
        data: {
          userId: user.id,
          name: botConfig.botUsername,
          selectedModel: selectedModel,
          status: 'running',
          railwayProjectId,
          railwayServiceId,
          deployedAt: new Date(),
          anthropicApiKey: platformApiKeys.anthropic || null,
          openaiApiKey: platformApiKeys.openai || null,
          googleApiKey: platformApiKeys.google || null,
        }
      });
    } else {
      bot = await prisma.bot.create({
        data: {
          userId: user.id,
          name: botConfig.botUsername,
          telegramBotToken: botConfig.botToken,
          telegramBotUsername: botConfig.botUsername,
          selectedModel: selectedModel,
          status: 'running',
          railwayProjectId,
          railwayServiceId,
          deployedAt: new Date(),
          anthropicApiKey: platformApiKeys.anthropic || null,
          openaiApiKey: platformApiKeys.openai || null,
          googleApiKey: platformApiKeys.google || null,
        },
      });
    }

    // Update Railway BOT_ID if needed
    if (railwayProjectId && railwayServiceId && !existingBot?.id) {
      try {
        const railwayClient = getRailwayClient();
        const envQuery = `
          query Project($id: String!) {
            project(id: $id) {
              environments(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `;
        const envData = await (railwayClient as any).query(envQuery, { id: railwayProjectId });
        const environmentId = envData.project.environments.edges[0]?.node.id;
        
        if (environmentId) {
          await railwayClient.updateEnvironmentVariable(
            railwayProjectId,
            environmentId,
            'BOT_ID',
            bot.id
          );
        }
      } catch (error: any) {
        console.error('Failed to update BOT_ID:', error.message);
      }
    }

    // Set up Telegram webhook
    const webhookUrl = process.env.WEBHOOK_URL 
      ? `${process.env.WEBHOOK_URL}/api/webhook/${bot.id}`
      : `https://clawdwako.vercel.app/api/webhook/${bot.id}`;

    try {
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${botConfig.botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl })
        }
      );
      const webhookData = await webhookResponse.json();
      console.log('Webhook setup:', webhookData.ok ? '✅ Success' : '❌ Failed');
    } catch (webhookError: any) {
      console.error('Webhook setup error:', webhookError.message);
    }

    // Mark payment as deployed
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          ...(payment.metadata as object || {}),
          deployed: true,
          botId: bot.id,
          deployedAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        username: bot.telegramBotUsername,
        status: bot.status,
        railwayProjectId,
        railwayServiceId,
      },
      message: 'Bot deployed successfully!'
    });

  } catch (error: any) {
    console.error('Deploy after payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deploy bot' },
      { status: 500 }
    );
  }
}
