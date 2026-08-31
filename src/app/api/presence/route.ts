import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

// POST /api/presence: Send heartbeat for current user (TTL 35 seconds)
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const isTypingFor = body?.typingFor || null; // optional: other user ID they are currently typing to

    const presenceData = {
      userId,
      name: session.user.name || "Developer",
      status: "online",
      isTypingFor,
      lastSeen: new Date().toISOString(),
    };

    // Store presence in Redis with 35s auto-expire TTL
    try {
      await redis.set(`presence:${userId}`, JSON.stringify(presenceData), { ex: 35 });
      if (isTypingFor) {
        await redis.set(`typing:${userId}:${isTypingFor}`, "1", { ex: 6 });
      } else {
        await redis.del(`typing:${userId}:${body?.stoppedTypingFor || ""}`);
      }
    } catch (redisErr) {
      console.warn("Redis presence heartbeat error:", redisErr);
    }

    return NextResponse.json({ success: true, presence: presenceData });
  } catch (error) {
    console.error("POST /api/presence error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET /api/presence?userIds=id1,id2,id3: Get online status for specific users
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdsParam = searchParams.get("userIds");
    const activeChatPartnerId = searchParams.get("activePartnerId");

    if (!userIdsParam) {
      return NextResponse.json({ presence: {} });
    }

    const userIds = userIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
    const presenceMap: Record<string, { isOnline: boolean; isTyping: boolean; lastSeen: string }> = {};

    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const raw = await redis.get(`presence:${uid}`);
          let isOnline = false;
          let lastSeen = "";
          let isTyping = false;

          if (raw) {
            isOnline = true;
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            lastSeen = parsed.lastSeen || new Date().toISOString();
          }

          if (activeChatPartnerId && activeChatPartnerId === uid) {
            const typingCheck = await redis.get(`typing:${uid}:${session.user.id}`);
            isTyping = Boolean(typingCheck);
          }

          presenceMap[uid] = {
            isOnline,
            isTyping,
            lastSeen: lastSeen || new Date().toISOString(),
          };
        } catch (err) {
          presenceMap[uid] = {
            isOnline: false,
            isTyping: false,
            lastSeen: new Date().toISOString(),
          };
        }
      })
    );

    return NextResponse.json({ presence: presenceMap });
  } catch (error) {
    console.error("GET /api/presence error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
