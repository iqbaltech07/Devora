import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

// GET: Get chat history with a specific user
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");

    if (!otherUserId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      conversationId: otherUserId,
      senderId: m.senderId,
      senderName: m.sender?.name || (m.senderId === session.user.id ? session.user.name : "Developer"),
      content: m.content,
      read: Boolean(m.read),
      sentAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await request.json();

    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
        read: false,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const formatted = {
      id: newMessage.id,
      conversationId: receiverId,
      senderId: newMessage.senderId,
      senderName: newMessage.sender?.name || session.user.name || "Me",
      content: newMessage.content,
      read: false,
      sentAt: newMessage.createdAt instanceof Date ? newMessage.createdAt.toISOString() : String(newMessage.createdAt),
    };

    // Push realtime event to receiver's Redis inbox queue
    try {
      await redis.lpush(`chat:inbox:${receiverId}`, JSON.stringify(formatted));
      await redis.ltrim(`chat:inbox:${receiverId}`, 0, 49);
      await redis.expire(`chat:inbox:${receiverId}`, 86400);
    } catch (redisErr) {
      console.warn("Redis push inbox error:", redisErr);
    }

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Mark messages as read
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { senderId } = await request.json().catch(() => ({}));
    if (!senderId) {
      return NextResponse.json({ error: "senderId is required" }, { status: 400 });
    }

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
