import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all users with their bot count
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            bots: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const totalUsers = users.length;
    const totalBots = users.reduce((sum, user) => sum + user._count.bots, 0);
    const activeUsers = users.filter((user) => user._count.bots > 0).length;

    // Users who joined today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = users.filter(
      (user) => new Date(user.createdAt) >= today
    ).length;

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalBots,
        activeUsers,
        newUsersToday,
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
