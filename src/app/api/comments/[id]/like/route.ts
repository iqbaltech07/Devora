import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/comments/[id]/like: Toggle like on a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: commentId } = await params;
    const currentUserId = session.user.id;

    // Check existing like
    const existing = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: currentUserId,
        },
      },
    });

    let isLiked = false;
    if (existing) {
      await prisma.commentLike.delete({
        where: { id: existing.id },
      });
      isLiked = false;
    } else {
      await prisma.commentLike.create({
        data: {
          commentId,
          userId: currentUserId,
        },
      });
      isLiked = true;
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId },
    });

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
    });
  } catch (error: any) {
    console.error("POST /api/comments/[id]/like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle comment like", details: error.message },
      { status: 500 }
    );
  }
}
