import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/users/[id]/follow: Get follow status & counts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const [followersCount, followingCount, followRecord, reverseFollowRecord] =
      await Promise.all([
        prisma.follow.count({ where: { followingId: targetUserId } }),
        prisma.follow.count({ where: { followerId: targetUserId } }),
        currentUserId
          ? prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: targetUserId,
                },
              },
            })
          : null,
        currentUserId
          ? prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: targetUserId,
                  followingId: currentUserId,
                },
              },
            })
          : null,
      ]);

    return NextResponse.json({
      followersCount,
      followingCount,
      isFollowing: Boolean(followRecord),
      isFollowedBy: Boolean(reverseFollowRecord),
    });
  } catch (error: any) {
    console.error("GET /api/users/[id]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/users/[id]/follow: Toggle follow / unfollow user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: targetUserId } = await params;
    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: "Tidak dapat mengikuti profil sendiri" },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Check existing follow
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    // Check if target user already follows current user (for Follow Back detection)
    const reverseFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: targetUserId,
          followingId: currentUserId,
        },
      },
    });

    let isFollowing = false;
    let isFollowBack = false;

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existing.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      isFollowing = true;
      isFollowBack = Boolean(reverseFollow);
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
    ]);

    return NextResponse.json({
      success: true,
      isFollowing,
      isFollowBack,
      isFollowedBy: Boolean(reverseFollow),
      followersCount,
      followingCount,
    });
  } catch (error: any) {
    console.error("POST /api/users/[id]/follow error:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow", details: error.message },
      { status: 500 }
    );
  }
}
