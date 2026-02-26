import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;

    // Get bot from database
    const bot = await prisma.bot.findUnique({
      where: { id: botId }
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    if (!bot.railwayServiceId) {
      return NextResponse.json({ error: 'Bot not deployed to Railway' }, { status: 400 });
    }

    // Trigger Railway redeploy using GraphQL API
    const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;
    
    if (!RAILWAY_TOKEN) {
      return NextResponse.json({ error: 'Railway token not configured' }, { status: 500 });
    }

    const mutation = `
      mutation serviceInstanceRedeploy($serviceId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId)
      }
    `;

    const response = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: mutation,
        variables: {
          serviceId: bot.railwayServiceId
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${RAILWAY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      console.error('Railway redeploy error:', response.data.errors);
      return NextResponse.json({ 
        error: 'Failed to redeploy',
        details: response.data.errors 
      }, { status: 500 });
    }

    // Update bot status
    await prisma.bot.update({
      where: { id: botId },
      data: {
        status: 'deploying',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Redeploy triggered successfully',
      botId,
      serviceId: bot.railwayServiceId
    });

  } catch (error: any) {
    console.error('Redeploy error:', error);
    return NextResponse.json({ 
      error: 'Failed to trigger redeploy',
      message: error.message 
    }, { status: 500 });
  }
}
