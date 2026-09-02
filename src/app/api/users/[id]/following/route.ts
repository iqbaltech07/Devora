import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/users/[id]/following: Get list of developers following
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const follows = await prisma.follow.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
            githubUsername: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const followingIds = follows.map((f) => f.following.id);
    const myFollowing = currentUserId
      ? await prisma.follow.findMany({
          where: {
            followerId: currentUserId,
            followingId: { in: followingIds },
          },
          select: { followingId: true },
        })
      : [];

    const myFollowingSet = new Set(myFollowing.map((f) => f.followingId));

    const formatted = follows.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      avatarUrl: f.following.image || (f.following.githubUsername ? `https://github.com/${f.following.githubUsername}.png` : undefined),
      title: f.following.title || "Developer",
      isFollowing: myFollowingSet.has(f.following.id),
      isMe: currentUserId === f.following.id,
      followedAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/users/[id]/following error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
