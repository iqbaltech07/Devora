import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

// GET /api/notifications: Fetch incoming likes, matches, and unread messages as rich notifications
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // 1. Fetch incoming likes (Users who swiped RIGHT on currentUser)
    const incomingSwipes = await prisma.swipe.findMany({
      where: {
        swipedId: currentUserId,
        direction: "RIGHT",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const swiperIds = incomingSwipes.map((s) => s.swiperId);

    // 2. Fetch mutual matches
    const mutualMatches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const partnerIds = mutualMatches.map((m) =>
      m.user1Id === currentUserId ? m.user2Id : m.user1Id
    );

    // 3. Fetch unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: currentUserId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const senderIds = unreadMessages.map((m) => m.senderId);

    // Gather all related user profiles
    const allUserIds = Array.from(
      new Set([...swiperIds, ...partnerIds, ...senderIds])
    );

    const relatedUsers =
      allUserIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: allUserIds } },
            select: {
              id: true,
              name: true,
              image: true,
              title: true,
              tags: true,
            },
          })
        : [];

    const userMap = new Map(relatedUsers.map((u) => [u.id, u]));

    const notifications = [];

    // Format Incoming Likes
    for (const swipe of incomingSwipes) {
      const swiper = userMap.get(swipe.swiperId);
      if (!swiper) continue;
      notifications.push({
        id: `swipe-like-${swipe.id}`,
        type: "LIKE",
        title: "Menyukai Profil Kamu!",
        message: `${swiper.name || "Seorang developer"} (${swiper.title || "Developer"}) tertarik dengan profilmu. Geser kanan untuk auto-match!`,
        actorId: swiper.id,
        actorName: swiper.name || "Developer",
        actorAvatar: swiper.image || undefined,
        actorRole: swiper.title || "Developer",
        linkUrl: "/matches",
        read: false,
        createdAt: timeAgo(swipe.createdAt),
        timestamp: new Date(swipe.createdAt).getTime(),
      });
    }

    // Format Matches
    for (const match of mutualMatches) {
      const partnerId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
      const partner = userMap.get(partnerId);
      if (!partner) continue;
      notifications.push({
        id: `match-item-${match.id}`,
        type: "MATCH",
        title: "Yeay, Match Baru Terbentuk!",
        message: `Kamu dan ${partner.name || "Partner"} saling menyukai! Mulai obrolan untuk berkolaborasi.`,
        actorId: partner.id,
        actorName: partner.name || "Partner",
        actorAvatar: partner.image || undefined,
        actorRole: partner.title || "Partner",
        linkUrl: "/messages",
        read: false,
        createdAt: timeAgo(match.createdAt),
        timestamp: new Date(match.createdAt).getTime(),
      });
    }

    // Format Unread Messages
    for (const msg of unreadMessages) {
      const sender = userMap.get(msg.senderId);
      if (!sender) continue;
      notifications.push({
        id: `msg-item-${msg.id}`,
        type: "SYSTEM",
        title: "Pesan Baru",
        message: `${sender.name || "Partner"}: "${msg.content.slice(0, 60)}${msg.content.length > 60 ? "..." : ""}"`,
        actorId: sender.id,
        actorName: sender.name || "Partner",
        actorAvatar: sender.image || undefined,
        actorRole: sender.title || "Developer",
        linkUrl: "/messages",
        read: false,
        createdAt: timeAgo(msg.createdAt),
        timestamp: new Date(msg.createdAt).getTime(),
      });
    }

    // Sort by newest
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "Failed to load notifications", details: error.message },
      { status: 500 }
    );
  }
}
