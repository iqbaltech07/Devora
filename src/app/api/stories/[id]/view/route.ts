import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/stories/[id]/view: Mark story as viewed by current user
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: storyId } = await params;
    const currentUserId = session.user.id;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, authorId: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Don't record author's own view as a viewer
    if (story.authorId === currentUserId) {
      return NextResponse.json({ success: true, message: "Author view ignored" });
    }

    // Upsert story view
    await prisma.storyView.upsert({
      where: {
        storyId_viewerId: {
          storyId,
          viewerId: currentUserId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        storyId,
        viewerId: currentUserId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/stories/[id]/view error:", error);
    return NextResponse.json({ error: "Failed to record story view", details: error.message }, { status: 500 });
  }
}
