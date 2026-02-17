import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await request.json();

    // Only allow users to get their own user ID
    if (email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden - Can only get your own user ID' },
        { status: 403 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id
    });

  } catch (error: any) {
    console.error('Failed to get user ID by email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
