import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      botId,
      model,
      provider,
      inputTokens = 0,
      outputTokens = 0,
      totalTokens = 0,
      estimatedCost = 0,
      requestType = 'message',
      success = true,
      errorMessage = null,
      metadata = null,
    } = data;

    // Validate required fields
    if (!botId || !model || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: botId, model, provider' },
        { status: 400 }
      );
    }

    // Create usage record
    const usage = await prisma.apiUsage.create({
      data: {
        botId,
        model,
        provider,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        requestType,
        success,
        errorMessage,
        metadata,
      },
    });

    return NextResponse.json({ 
      success: true, 
      usageId: usage.id 
    });

  } catch (error: any) {
    console.error('Error logging API usage:', error);
    return NextResponse.json(
      { error: 'Failed to log usage', details: error.message },
      { status: 500 }
    );
  }
}

// Get usage stats for a bot or all bots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    
    if (botId) {
      where.botId = botId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get aggregated stats
    const stats = await prisma.apiUsage.groupBy({
      by: ['model', 'provider'],
      where,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        estimatedCost: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent usage records
    const recentUsage = await prisma.apiUsage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Calculate total cost
    const totalCost = await prisma.apiUsage.aggregate({
      where,
      _sum: {
        estimatedCost: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats,
      recentUsage,
      totalCost: totalCost._sum.estimatedCost || 0,
    });

  } catch (error: any) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats', details: error.message },
      { status: 500 }
    );
  }
}
