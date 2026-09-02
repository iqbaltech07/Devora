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

// GET /api/notifications: Fetch social likes, comments, comment likes/replies, mentions, follows, messages, matches, and project updates
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Get current user details for precise mention matching
    const currentUserRecord = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { id: true, name: true, githubUsername: true },
    });

    // 1. Fetch incoming follows (who followed currentUser)
    const incomingFollows = await prisma.follow.findMany({
      where: {
        followingId: currentUserId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Check mutual follows
    const followerIds = incomingFollows.map((f) => f.follower.id);
    const myFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerIds },
      },
      select: { followingId: true },
    });
    const myFollowSet = new Set(myFollows.map((mf) => mf.followingId));

    // 2. Fetch post likes on current user's posts
    const postLikes = await prisma.postLike.findMany({
      where: {
        post: { authorId: currentUserId },
        userId: { not: currentUserId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // 3. Fetch root comments on current user's posts
    const postComments = await prisma.comment.findMany({
      where: {
        post: { authorId: currentUserId },
        authorId: { not: currentUserId },
        parentId: null, // Only root comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // 4. Fetch Comment Likes (Likes on comments authored by current user)
    const commentLikes = await prisma.commentLike.findMany({
      where: {
        comment: { authorId: currentUserId },
        userId: { not: currentUserId },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            postId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // 5. Fetch Nested Comment Replies (Replies to comments authored by current user)
    const commentReplies = await prisma.comment.findMany({
      where: {
        parent: { authorId: currentUserId },
        authorId: { not: currentUserId },
        parentId: { not: null },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            postId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    // 6. Fetch Post Mentions / Tag Teman (@)
    const mentionTerms: string[] = [];
    if (currentUserRecord?.githubUsername) {
      mentionTerms.push(`@${currentUserRecord.githubUsername}`);
    }
    if (currentUserRecord?.name) {
      mentionTerms.push(`@${currentUserRecord.name}`);
      mentionTerms.push(`@${currentUserRecord.name.replace(/\s+/g, "_")}`);
      mentionTerms.push(`@${currentUserRecord.name.replace(/\s+/g, "")}`);
    }
    mentionTerms.push(`@${currentUserId.slice(0, 8)}`);

    const mentionOrClauses = Array.from(new Set(mentionTerms)).map((term) => ({
      content: { contains: term, mode: "insensitive" as const },
    }));

    const mentionedPosts =
      mentionOrClauses.length > 0
        ? await prisma.post.findMany({
            where: {
              authorId: { not: currentUserId },
              OR: mentionOrClauses,
            },
            include: {
              author: {
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
            take: 15,
          })
        : [];

    // 7. Fetch incoming profile likes (Users who swiped RIGHT on currentUser)
    const incomingSwipes = await prisma.swipe.findMany({
      where: {
        swipedId: currentUserId,
        direction: "RIGHT",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const swiperIds = incomingSwipes.map((s) => s.swiperId);

    // 8. Fetch mutual matches
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

    // 9. Fetch unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        receiverId: currentUserId,
        read: false,
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const senderIds = unreadMessages.map((m) => m.senderId);

    // 10. Fetch Join Requests where current user is the Applicant (e.g. ACC / Accepted by Project Owner)
    const myApplications = await prisma.joinRequest.findMany({
      where: {
        applicantId: currentUserId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            authorId: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 15,
    });

    // 11. Fetch Incoming Join Requests where current user is the Project Author
    const incomingProjectRequests = await prisma.joinRequest.findMany({
      where: {
        project: {
          authorId: currentUserId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        applicant: {
          select: {
            id: true,
            name: true,
            image: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

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

    const notifications: any[] = [];

    // Format 0: Follow & Follow Back Notifications
    for (const f of incomingFollows) {
      if (!f.follower) continue;
      const isFollowBack = myFollowSet.has(f.follower.id);
      notifications.push({
        id: `follow-${f.id}`,
        type: isFollowBack ? "FOLLOW_BACK" : "FOLLOW",
        title: isFollowBack ? "Mengikuti Anda Balik" : "Mulai Mengikuti Profil Anda",
        message: isFollowBack
          ? `${f.follower.name || "Pengembang"} telah mengikuti Anda balik.`
          : `${f.follower.name || "Pengembang"} (${f.follower.title || "Pengembang"}) mulai mengikuti profil profesional Anda.`,
        actorId: f.follower.id,
        actorName: f.follower.name || "Pengembang",
        actorAvatar: f.follower.image || undefined,
        actorRole: f.follower.title || "Pengembang",
        linkUrl: `/profile/${f.follower.id}`,
        read: false,
        createdAt: timeAgo(f.createdAt),
        timestamp: new Date(f.createdAt).getTime(),
      });
    }

    // Format A: Post Likes
    for (const pl of postLikes) {
      if (!pl.user || !pl.post) continue;
      const snippet = pl.post.content ? `"${pl.post.content.slice(0, 40)}${pl.post.content.length > 40 ? "..." : ""}"` : "postingan Anda";
      notifications.push({
        id: `post-like-${pl.id}`,
        type: "LIKE",
        title: "Menyukai Postingan Anda",
        message: `${pl.user.name || "Pengembang"} memberikan apresiasi pada ${snippet}.`,
        actorId: pl.user.id,
        actorName: pl.user.name || "Pengembang",
        actorAvatar: pl.user.image || undefined,
        actorRole: pl.user.title || "Pengembang",
        linkUrl: `/posts/${pl.post.id}`,
        read: false,
        createdAt: timeAgo(pl.createdAt),
        timestamp: new Date(pl.createdAt).getTime(),
      });
    }

    // Format B: Post Comments
    for (const pc of postComments) {
      if (!pc.author || !pc.post) continue;
      notifications.push({
        id: `post-comment-${pc.id}`,
        type: "MESSAGE",
        title: "Mengomentari Postingan Anda",
        message: `${pc.author.name || "Pengembang"}: "${pc.content.slice(0, 50)}${pc.content.length > 50 ? "..." : ""}"`,
        actorId: pc.author.id,
        actorName: pc.author.name || "Pengembang",
        actorAvatar: pc.author.image || undefined,
        actorRole: pc.author.title || "Pengembang",
        linkUrl: `/posts/${pc.post.id}`,
        read: false,
        createdAt: timeAgo(pc.createdAt),
        timestamp: new Date(pc.createdAt).getTime(),
      });
    }

    // Format C: Comment Likes
    for (const cl of commentLikes) {
      if (!cl.user || !cl.comment) continue;
      const snippet = cl.comment.content ? `"${cl.comment.content.slice(0, 35)}${cl.comment.content.length > 35 ? "..." : ""}"` : "komentar Anda";
      notifications.push({
        id: `comment-like-${cl.id}`,
        type: "LIKE",
        title: "Menyukai Komentar Anda",
        message: `${cl.user.name || "Pengembang"} menyukai komentar Anda: ${snippet}`,
        actorId: cl.user.id,
        actorName: cl.user.name || "Pengembang",
        actorAvatar: cl.user.image || undefined,
        actorRole: cl.user.title || "Pengembang",
        linkUrl: `/posts/${cl.comment.postId}`,
        read: false,
        createdAt: timeAgo(cl.createdAt),
        timestamp: new Date(cl.createdAt).getTime(),
      });
    }

    // Format D: Comment Replies (Nested replies to my comments)
    for (const cr of commentReplies) {
      if (!cr.author || !cr.parent) continue;
      const parentSnippet = cr.parent.content ? `"${cr.parent.content.slice(0, 30)}${cr.parent.content.length > 30 ? "..." : ""}"` : "komentar Anda";
      notifications.push({
        id: `comment-reply-${cr.id}`,
        type: "MESSAGE",
        title: "Membalas Komentar Anda",
        message: `${cr.author.name || "Pengembang"} membalas ${parentSnippet}: "${cr.content.slice(0, 45)}${cr.content.length > 45 ? "..." : ""}"`,
        actorId: cr.author.id,
        actorName: cr.author.name || "Pengembang",
        actorAvatar: cr.author.image || undefined,
        actorRole: cr.author.title || "Pengembang",
        linkUrl: `/posts/${cr.parent.postId}`,
        read: false,
        createdAt: timeAgo(cr.createdAt),
        timestamp: new Date(cr.createdAt).getTime(),
      });
    }

    // Format E: Mentions in Community Posts (@)
    for (const mp of mentionedPosts) {
      if (!mp.author) continue;
      const snippet = mp.content ? `"${mp.content.slice(0, 50)}${mp.content.length > 50 ? "..." : ""}"` : "sebuah postingan";
      notifications.push({
        id: `post-mention-${mp.id}`,
        type: "MESSAGE",
        title: "Menyebut Anda dalam Postingan",
        message: `${mp.author.name || "Pengembang"} menandai akun Anda di feeds: ${snippet}`,
        actorId: mp.author.id,
        actorName: mp.author.name || "Pengembang",
        actorAvatar: mp.author.image || (mp.author.githubUsername ? `https://github.com/${mp.author.githubUsername}.png` : undefined),
        actorRole: mp.author.title || "Pengembang",
        linkUrl: `/posts/${mp.id}`,
        read: false,
        createdAt: timeAgo(mp.createdAt),
        timestamp: new Date(mp.createdAt).getTime(),
      });
    }

    // Format F: My Project Applications (ACC / Accepted or Rejected)
    for (const app of myApplications) {
      if (!app.project) continue;
      const author = app.project.author;

      if (app.status === "ACCEPTED") {
        notifications.push({
          id: `project-acc-${app.id}`,
          type: "PROJECT_INVITE",
          title: "Lamaran Proyek Diterima",
          message: `Selamat! Pengajuan Anda untuk peran "${app.roleTitle}" di proyek "${app.project.title}" telah DITERIMA oleh ${author?.name || "Pemilik Proyek"}. Anda resmi bergabung dengan tim!`,
          actorId: author?.id,
          actorName: author?.name || "Pemilik Proyek",
          actorAvatar: author?.image || undefined,
          actorRole: author?.title || "Pemilik Proyek",
          linkUrl: "/projects?tab=applications",
          read: false,
          createdAt: timeAgo(app.updatedAt),
          timestamp: new Date(app.updatedAt).getTime(),
        });
      } else if (app.status === "REJECTED") {
        notifications.push({
          id: `project-rej-${app.id}`,
          type: "SYSTEM",
          title: "Pembaruan Pengajuan Proyek",
          message: `Pengajuan Anda untuk posisi "${app.roleTitle}" di proyek "${app.project.title}" belum dapat diterima saat ini.`,
          actorId: author?.id,
          actorName: author?.name || "Pemilik Proyek",
          actorAvatar: author?.image || undefined,
          actorRole: author?.title || "Pemilik Proyek",
          linkUrl: "/projects?tab=applications",
          read: false,
          createdAt: timeAgo(app.updatedAt),
          timestamp: new Date(app.updatedAt).getTime(),
        });
      }
    }

    // Format G: Incoming Applications for My Authored Projects
    for (const req of incomingProjectRequests) {
      if (!req.applicant || !req.project) continue;
      notifications.push({
        id: `project-incoming-${req.id}`,
        type: "PROJECT_INVITE",
        title: "Lamaran Proyek Masuk",
        message: `${req.applicant.name || "Pengembang"} (${req.applicant.title || "Pengembang"}) mengajukan diri untuk peran "${req.roleTitle}" pada proyek "${req.project.title}".`,
        actorId: req.applicant.id,
        actorName: req.applicant.name || "Pengembang",
        actorAvatar: req.applicant.image || undefined,
        actorRole: req.applicant.title || "Pengembang",
        linkUrl: "/projects?tab=my-projects",
        read: req.status !== "PENDING",
        createdAt: timeAgo(req.createdAt),
        timestamp: new Date(req.createdAt).getTime(),
      });
    }

    // Format H: Incoming Likes
    for (const swipe of incomingSwipes) {
      const swiper = userMap.get(swipe.swiperId);
      if (!swiper) continue;
      notifications.push({
        id: `swipe-like-${swipe.id}`,
        type: "LIKE",
        title: "Menyukai Profil Anda",
        message: `${swiper.name || "Seorang pengembang"} (${swiper.title || "Pengembang"}) tertarik dengan profil Anda. Geser ke kanan untuk mencocokkan profil!`,
        actorId: swiper.id,
        actorName: swiper.name || "Pengembang",
        actorAvatar: swiper.image || undefined,
        actorRole: swiper.title || "Pengembang",
        linkUrl: "/matches",
        read: false,
        createdAt: timeAgo(swipe.createdAt),
        timestamp: new Date(swipe.createdAt).getTime(),
      });
    }

    // Format I: Mutual Matches
    for (const match of mutualMatches) {
      const partnerId = match.user1Id === currentUserId ? match.user2Id : match.user1Id;
      const partner = userMap.get(partnerId);
      if (!partner) continue;
      notifications.push({
        id: `match-item-${match.id}`,
        type: "MATCH",
        title: "Kecocokan Kolaborasi Terbentuk",
        message: `Anda dan ${partner.name || "Rekan"} saling tertarik! Mulai percakapan untuk memulai kolaborasi.`,
        actorId: partner.id,
        actorName: partner.name || "Rekan Pengembang",
        actorAvatar: partner.image || undefined,
        actorRole: partner.title || "Rekan Pengembang",
        linkUrl: `/messages?userId=${partner.id}`,
        read: false,
        createdAt: timeAgo(match.createdAt),
        timestamp: new Date(match.createdAt).getTime(),
      });
    }

    // Format J: Unread Messages
    for (const msg of unreadMessages) {
      const sender = userMap.get(msg.senderId);
      if (!sender) continue;
      notifications.push({
        id: `msg-item-${msg.id}`,
        type: "MESSAGE",
        title: "Pesan Baru",
        message: `${sender.name || "Rekan"}: "${msg.content.slice(0, 60)}${msg.content.length > 60 ? "..." : ""}"`,
        actorId: sender.id,
        actorName: sender.name || "Partner",
        actorAvatar: sender.image || undefined,
        actorRole: sender.title || "Developer",
        linkUrl: `/messages?userId=${sender.id}`,
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
