import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/posts/[id]/bookmark: Toggle bookmark on a post
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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    let isBookmarked = false;

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      isBookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: {
          postId,
          userId,
        },
      });
      isBookmarked = true;
    }

    const bookmarkCount = await prisma.bookmark.count({ where: { postId } });

    return NextResponse.json({
      success: true,
      isBookmarked,
      bookmarkCount,
    });
  } catch (error) {
    console.error("POST /api/posts/[id]/bookmark error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
