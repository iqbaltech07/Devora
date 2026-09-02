import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/users/[id]/followers: Get list of followers
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const follows = await prisma.follow.findMany({
      where: { followingId: targetUserId },
      include: {
        follower: {
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

    // Check which ones current user is following
    const followerIds = follows.map((f) => f.follower.id);
    const myFollowing = currentUserId
      ? await prisma.follow.findMany({
          where: {
            followerId: currentUserId,
            followingId: { in: followerIds },
          },
          select: { followingId: true },
        })
      : [];

    const myFollowingSet = new Set(myFollowing.map((f) => f.followingId));

    const formatted = follows.map((f) => ({
      id: f.follower.id,
      name: f.follower.name,
      avatarUrl: f.follower.image || (f.follower.githubUsername ? `https://github.com/${f.follower.githubUsername}.png` : undefined),
      title: f.follower.title || "Developer",
      isFollowing: myFollowingSet.has(f.follower.id),
      isMe: currentUserId === f.follower.id,
      followedAt: f.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("GET /api/users/[id]/followers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
