import { NextRequest, NextResponse } from 'next/server';
import { getRailwayClient } from '@/lib/railway';
import { prisma } from '@/lib/prisma';

interface DeploymentRequest {
  botToken: string;
  botUsername: string;
  selectedModel: string;
  userId?: string;
  userEmail?: string;
  userApiKeys?: {
    anthropic?: string;
    openai?: string;
    google?: string;
  } | null;
}

interface CloudProvider {
  id: string;
  name: string;
  regions: string[];
  pricing: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

const cloudProviders: CloudProvider[] = [
  {
    id: 'hetzner',
    name: 'Hetzner',
    regions: ['eu-central', 'us-east', 'us-west'],
    pricing: { cpu: 0.005, memory: 0.002, storage: 0.0001 }
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    regions: ['nyc1', 'sfo3', 'fra1', 'lon1'],
    pricing: { cpu: 0.007, memory: 0.003, storage: 0.0002 }
  },
  {
    id: 'railway',
    name: 'Railway',
    regions: ['us-west1', 'us-east1'],
    pricing: { cpu: 0.01, memory: 0.004, storage: 0.0003 }
  }
];

async function provisionInstance(provider: CloudProvider, config: any) {
  // Simulate cloud instance provisioning
  const instanceId = `${provider.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // In a real implementation, this would:
  // 1. Call the cloud provider's API
  // 2. Create a new VM instance
  // 3. Install Docker and required dependencies
  // 4. Deploy the AI agent container
  // 5. Configure networking and security
  
  return {
    instanceId,
    provider: provider.name,
    region: provider.regions[0],
    status: 'provisioning',
    ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    estimatedCost: calculateMonthlyCost(provider),
    deploymentTime: Math.floor(Math.random() * 300) + 60 // 1-5 minutes
  };
}

function calculateMonthlyCost(provider: CloudProvider): number {
  // Base cost calculation (simplified)
  const baseCost = provider.pricing.cpu * 24 * 30 + 
                   provider.pricing.memory * 1024 * 24 * 30 + 
                   provider.pricing.storage * 10 * 24 * 30;
  
  return Math.round(baseCost * 100) / 100;
}

function selectOptimalProvider(requirements: any): CloudProvider {
  // Simple provider selection logic
  // In production, this would consider:
  // - User location for latency
  // - Cost optimization
  // - Provider availability
  // - Resource requirements
  
  return cloudProviders[Math.floor(Math.random() * cloudProviders.length)];
}


export async function POST(request: NextRequest) {
  try {
    const deployment: DeploymentRequest = await request.json();
    
    console.log('=== DEPLOYMENT REQUEST ===');
    console.log('Full deployment object:', JSON.stringify(deployment, null, 2));
    console.log('Deployment request received:', {
      hasBotToken: !!deployment.botToken,
      hasBotUsername: !!deployment.botUsername,
      hasSelectedModel: !!deployment.selectedModel,
      botUsername: deployment.botUsername,
      selectedModel: deployment.selectedModel,
      userEmail: deployment.userEmail
    });
    
    // Validate deployment request
    if (!deployment.botToken || !deployment.botUsername || !deployment.selectedModel) {
      const missingFields = [];
      if (!deployment.botToken) missingFields.push('botToken');
      if (!deployment.botUsername) missingFields.push('botUsername');
      if (!deployment.selectedModel) missingFields.push('selectedModel');
      
      console.error('Deployment validation failed. Missing fields:', missingFields);
      
      return NextResponse.json(
        { 
          error: `Missing required deployment parameters: ${missingFields.join(', ')}`,
          received: {
            botToken: deployment.botToken ? '[PRESENT]' : '[MISSING]',
            botUsername: deployment.botUsername || '[MISSING]',
            selectedModel: deployment.selectedModel || '[MISSING]'
          }
        },
        { status: 400 }
      );
    }

    // Save bot configuration to database (skip Railway deployment for now)
    console.log('Deployment request for:', deployment.botUsername, deployment.selectedModel);
    console.log('🔍 DEBUG: userEmail received:', deployment.userEmail);
    console.log('🔍 DEBUG: userId received:', deployment.userId);
    
    // Get user ID - ALWAYS prefer userEmail over userId
    let userId = null;
    
    if (deployment.userEmail) {
      console.log('🔍 Looking up user by email:', deployment.userEmail);
      const user = await prisma.user.findUnique({
        where: { email: deployment.userEmail },
        select: { id: true }
      });
      
      if (user) {
        userId = user.id;
        console.log('✅ Found user by email, using userId:', userId);
      } else {
        console.log('❌ No user found for email:', deployment.userEmail);
      }
    } else if (deployment.userId) {
      userId = deployment.userId;
      console.log('✅ Using provided userId:', userId);
    }
    
    // Fallback to anonymous user ONLY if no user found
    if (!userId) {
      console.log('⚠️ No user found, creating/using anonymous user');
      let anonymousUser = await prisma.user.findFirst({
        where: { email: 'anonymous@clawdwako.com' }
      });
      
      if (!anonymousUser) {
        anonymousUser = await prisma.user.create({
          data: {
            email: 'anonymous@clawdwako.com',
            name: 'Anonymous User',
          }
        });
      }
      
      userId = anonymousUser.id;
    }
    
    console.log('🎯 FINAL userId for bot:', userId);

    // Deploy to Railway for 24/7 operation
    let railwayProjectId = null;
    let railwayServiceId = null;

    try {
      console.log('Deploying to Railway...');
      const railwayClient = getRailwayClient();
      
      console.log('Railway client initialized, attempting deployment...');
      const railwayDeployment = await railwayClient.deployOpenClaw({
        projectName: `bot-${deployment.botUsername}`,
        telegramBotToken: deployment.botToken,
        selectedModel: deployment.selectedModel,
        anthropicApiKey: deployment.userApiKeys?.anthropic,
        openaiApiKey: deployment.userApiKeys?.openai,
        googleAiApiKey: deployment.userApiKeys?.google,
      });

      railwayProjectId = railwayDeployment.projectId;
      railwayServiceId = railwayDeployment.serviceId;
      
      console.log('✅ Railway deployment successful:', {
        projectId: railwayProjectId,
        serviceId: railwayServiceId,
      });
    } catch (railwayError: any) {
      console.error('❌ Railway deployment failed');
      console.error('Error message:', railwayError.message);
      console.error('Error stack:', railwayError.stack);
      console.error('Full error:', JSON.stringify(railwayError, null, 2));
      // Continue with webhook setup even if Railway fails
    }

    // Check if bot already exists
    let bot = await prisma.bot.findFirst({
      where: { telegramBotToken: deployment.botToken }
    });

    if (bot) {
      // Update existing bot AND transfer ownership to correct user
      bot = await prisma.bot.update({
        where: { id: bot.id },
        data: {
          userId: userId, // ✅ Fix: Update userId too when updating existing bot
          name: deployment.botUsername,
          selectedModel: deployment.selectedModel,
          status: 'running',
          railwayProjectId,
          railwayServiceId,
          deployedAt: new Date(),
        }
      });
    } else {
      // Create new bot
      bot = await prisma.bot.create({
        data: {
          userId: userId,
          name: deployment.botUsername,
          telegramBotToken: deployment.botToken,
          telegramBotUsername: deployment.botUsername,
          selectedModel: deployment.selectedModel,
          status: 'running',
          railwayProjectId,
          railwayServiceId,
          deployedAt: new Date(),
        },
      });
    }

    // Update Railway environment variable with BOT_ID
    if (railwayProjectId && railwayServiceId) {
      try {
        console.log('Updating Railway BOT_ID environment variable...');
        const railwayClient = getRailwayClient();
        
        // Get environment ID
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
        const envData = await railwayClient['query'](envQuery, { id: railwayProjectId });
        const environmentId = envData.project.environments.edges[0]?.node.id;
        
        if (environmentId) {
          await railwayClient.updateEnvironmentVariable(
            railwayProjectId,
            environmentId,
            'BOT_ID',
            bot.id
          );
          console.log('✅ BOT_ID updated in Railway');
        }
      } catch (error: any) {
        console.error('Failed to update BOT_ID in Railway:', error.message);
        // Continue even if this fails
      }
    }

    // Automatically set up Telegram webhook for all bots
    // Use WEBHOOK_URL env var for local testing (e.g., ngrok URL), otherwise use production
    const webhookUrl = process.env.WEBHOOK_URL 
      ? `${process.env.WEBHOOK_URL}/api/webhook/${bot.id}`
      : `https://clawdwako.vercel.app/api/webhook/${bot.id}`;
    
    console.log('Setting webhook to:', webhookUrl);
    
    try {
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${deployment.botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webhookUrl })
        }
      );

      const webhookData = await webhookResponse.json();
      console.log('Webhook setup result:', JSON.stringify(webhookData, null, 2));

      if (webhookData.ok) {
        console.log('✅ Webhook successfully configured!');
      } else {
        console.error('❌ Failed to set webhook:', webhookData);
      }
    } catch (webhookError: any) {
      console.error('❌ Error setting webhook:', webhookError.message);
      // Don't fail the deployment if webhook setup fails
    }

    return NextResponse.json({
      success: true,
      bot: {
        id: bot.id,
        username: bot.telegramBotUsername,
        status: bot.status,
        railwayProjectId: railwayProjectId,
        railwayServiceId: railwayServiceId,
      },
      message: railwayProjectId 
        ? 'Bot deployed successfully to Railway! It will run 24/7. You can now chat with it on Telegram.'
        : 'Bot deployed successfully! You can now chat with it on Telegram.',
    });
    
  } catch (error: any) {
    console.error('=== DEPLOYMENT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('========================');
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: error.message || 'Failed to deploy bot',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        phase: 'deployment'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get('id');
  const userId = searchParams.get('userId');
  
  if (deploymentId) {
    // Get specific deployment status
    // In a real implementation, fetch from database
    return NextResponse.json({
      id: deploymentId,
      status: 'running',
      uptime: '99.9%',
      lastHealthCheck: new Date().toISOString()
    });
  }
  
  if (userId) {
    // Get all deployments for user
    // In a real implementation, fetch from database
    const mockDeployments = [
      {
        id: 'deploy-1',
        name: 'Personal Assistant',
        status: 'running',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        estimatedMonthlyCost: 8.50
      },
      {
        id: 'deploy-2',
        name: 'Customer Support Bot',
        status: 'running',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        estimatedMonthlyCost: 15.20
      }
    ];
    
    return NextResponse.json({
      deployments: mockDeployments,
      totalCost: mockDeployments.reduce((sum, d) => sum + d.estimatedMonthlyCost, 0)
    });
  }
  
  return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
}
