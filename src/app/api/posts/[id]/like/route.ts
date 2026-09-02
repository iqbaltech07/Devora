import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/posts/[id]/like: Toggle like on a post
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
      isLiked = true;
    }

    const likeCount = await prisma.postLike.count({ where: { postId } });

    return NextResponse.json({
      success: true,
      isLiked,
      likeCount,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
