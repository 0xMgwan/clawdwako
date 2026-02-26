import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { deployOpenClawInstance } from '@/lib/openclaw-deploy';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
        openclawInstances: {
          where: { status: { in: ['deploying', 'active'] } }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check subscription and instance limits
    const subscription = user.subscription;
    const activeInstances = user.openclawInstances.length;

    if (subscription) {
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return NextResponse.json({ 
          error: 'Subscription required',
          message: 'Please subscribe to deploy OpenClaw instances'
        }, { status: 403 });
      }

      if (activeInstances >= subscription.maxInstances) {
        return NextResponse.json({ 
          error: 'Instance limit reached',
          message: `Your ${subscription.tier} plan allows ${subscription.maxInstances} instance(s). Upgrade to deploy more.`
        }, { status: 403 });
      }
    } else {
      // No subscription - allow 1 free trial instance
      if (activeInstances >= 1) {
        return NextResponse.json({ 
          error: 'Trial limit reached',
          message: 'Subscribe to deploy more instances'
        }, { status: 403 });
      }
    }

    // Parse request body from frontend
    const body = await request.json();
    const {
      botToken,
      botUsername,
      selectedModel,
      userApiKeys,
      instanceName
    } = body;

    // Validate required fields
    if (!botToken || !selectedModel) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Bot token and model are required'
      }, { status: 400 });
    }

    // Extract API keys from userApiKeys object (if provided)
    const anthropicKey = userApiKeys?.anthropic || '';
    const openaiKey = userApiKeys?.openai || '';
    const googleKey = userApiKeys?.google || '';

    // Validate API key for selected model (only if user is using BYOK)
    if (userApiKeys) {
      if (selectedModel.includes('claude') && !anthropicKey) {
        return NextResponse.json({ 
          error: 'Anthropic API key required for Claude models'
        }, { status: 400 });
      }
      if (selectedModel.includes('gpt') && !openaiKey) {
        return NextResponse.json({ 
          error: 'OpenAI API key required for GPT models'
        }, { status: 400 });
      }
      if (selectedModel.includes('gemini') && !googleKey) {
        return NextResponse.json({ 
          error: 'Google API key required for Gemini models'
        }, { status: 400 });
      }
    }

    console.log('🚀 Deploying OpenClaw instance:', instanceName);

    // Deploy OpenClaw instance
    const instance = await deployOpenClawInstance({
      userId: user.id,
      userEmail: user.email!,
      selectedModel,
      channel: 'telegram', // Default to Telegram for now
      anthropicKey,
      openaiKey,
      googleKey,
      telegramToken: botToken,
      discordToken: undefined,
      whatsappToken: undefined
    });

    console.log('✅ OpenClaw instance deployed:', instance.instanceId);

    // Save instance to database
    const dbInstance = await prisma.openClawInstance.create({
      data: {
        userId: user.id,
        name: instanceName || botUsername || 'My OpenClaw',
        railwayProjectId: instance.railwayProjectId,
        railwayServiceId: instance.railwayServiceId,
        deploymentUrl: instance.deploymentUrl,
        model: selectedModel,
        channel: 'telegram',
        status: instance.status,
        anthropicKey,
        openaiKey,
        googleKey,
        telegramToken: botToken,
        discordToken: null,
        whatsappToken: null,
        lastHealthCheck: new Date()
      }
    });

    console.log('✅ Instance saved to database:', dbInstance.id);

    return NextResponse.json({
      success: true,
      instance: {
        id: dbInstance.id,
        name: dbInstance.name,
        username: botUsername, // For success modal
        model: dbInstance.model,
        channel: dbInstance.channel,
        status: dbInstance.status,
        deploymentUrl: dbInstance.deploymentUrl,
        railwayProjectId: dbInstance.railwayProjectId,
        createdAt: dbInstance.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ OpenClaw deployment failed:', error);
    
    return NextResponse.json({ 
      error: 'Deployment failed',
      message: error.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}
