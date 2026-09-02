import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/explore: Fetch showcase posts, popular tags, and active builders
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const tag = searchParams.get("tag");

    const whereClause: any = {};

    if (tag) {
      whereClause.tags = { has: tag.startsWith("#") ? tag : `#${tag}` };
    }

    if (search) {
      whereClause.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search.startsWith("#") ? search : `#${search}` } },
      ];
    }

    const [showcasePosts, activeBuilders] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              title: true,
              location: true,
              primaryStack: true,
              githubUsername: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy: [
          { likes: { _count: "desc" } },
          { createdAt: "desc" },
        ],
        take: 30,
      }),
      prisma.user.findMany({
        where: {
          id: currentUserId ? { not: currentUserId } : undefined,
          onboarded: true,
        },
        select: {
          id: true,
          name: true,
          image: true,
          title: true,
          location: true,
          primaryStack: true,
          githubUsername: true,
          experienceLevel: true,
        },
        take: 6,
      }),
    ]);

    const formattedPosts = showcasePosts.map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls,
      codeSnippet: post.codeSnippet,
      codeLanguage: post.codeLanguage,
      tags: post.tags,
      category: post.category,
      createdAt: post.createdAt.toISOString(),
      author: {
        id: post.author.id,
        name: post.author.name,
        avatarUrl: post.author.image || (post.author.githubUsername ? `https://github.com/${post.author.githubUsername}.png` : undefined),
        title: post.author.title || "Web Developer",
        primaryStack: post.author.primaryStack || [],
      },
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLiked: currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      featuredBuilders: activeBuilders.map((b) => ({
        id: b.id,
        name: b.name,
        avatarUrl: b.image || (b.githubUsername ? `https://github.com/${b.githubUsername}.png` : undefined),
        title: b.title || "Web Developer",
        location: b.location || "Indonesia",
        primaryStack: b.primaryStack || [],
        experienceLevel: b.experienceLevel || "Developer",
      })),
      trendingTags: [
        "#BuildInPublic",
        "#Nextjs",
        "#React",
        "#TailwindCSS",
        "#TypeScript",
        "#PostgreSQL",
        "#AI",
        "#Showcase",
        "#NeedPartner",
        "#Fullstack",
        "#Golang",
        "#UIUX",
      ],
    });
  } catch (error) {
    console.error("GET /api/explore error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
