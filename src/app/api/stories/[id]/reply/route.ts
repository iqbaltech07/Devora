import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST /api/stories/[id]/reply: Reply to story by sending direct chat message
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
    const { message } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan balasan tidak boleh kosong" }, { status: 400 });
    }

    const currentUserId = session.user.id;

    // Fetch story details
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story tidak ditemukan" }, { status: 404 });
    }

    // Format reply message with story reference
    const storySnippet = story.caption ? `"${story.caption.slice(0, 35)}..."` : "Sprint Story";
    const formattedContent = `[Membalas Story: ${storySnippet}] ${message.trim()}`;

    // Create chat message in DB
    const newMessage = await prisma.message.create({
      data: {
        senderId: currentUserId,
        receiverId: story.authorId,
        content: formattedContent,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      receiverId: story.authorId,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/stories/[id]/reply error:", error);
    return NextResponse.json({ error: "Failed to reply to story", details: error.message }, { status: 500 });
  }
}
