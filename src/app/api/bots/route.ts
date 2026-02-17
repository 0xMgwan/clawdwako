import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch ONLY the logged-in user's bots
    const bots = await prisma.bot.findMany({
      where: {
        userId: user.id  // ✅ Security: Only fetch this user's bots
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        telegramBotUsername: true,
        selectedModel: true,
        status: true,
        createdAt: true,
        deployedAt: true,
        railwayProjectId: true,
        railwayServiceId: true,
      }
    });

    return NextResponse.json({
      success: true,
      bots: bots
    });
  } catch (error: any) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bots', details: error.message },
      { status: 500 }
    );
  }
}
