import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// GET /api/posts: Fetch community feed posts with pagination & filter
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // SHOWCASE, BUILD_IN_PUBLIC, NEED_PARTNER, TECH_TIPS, ALL
    const tag = searchParams.get("tag");
    const authorId = searchParams.get("authorId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (category && category !== "ALL") {
      whereClause.category = category;
    }
    if (tag) {
      whereClause.tags = { has: tag.startsWith("#") ? tag : `#${tag}` };
    }
    if (authorId) {
      whereClause.authorId = authorId;
    }

    const [posts, total] = await Promise.all([
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
          project: {
            select: {
              id: true,
              title: true,
              stage: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            where: { parentId: null }, // Only root comments
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
              likes: true,
              replies: {
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
                  likes: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
            orderBy: { createdAt: "asc" },
            take: 5,
          },
          bookmarks: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    const formattedPosts = posts.map((post) => {
      const isLiked = currentUserId ? post.likes.some((l) => l.userId === currentUserId) : false;
      const isBookmarked = currentUserId ? post.bookmarks.some((b) => b.userId === currentUserId) : false;

      return {
        id: post.id,
        content: post.content,
        mediaUrls: post.mediaUrls,
        codeSnippet: post.codeSnippet,
        codeLanguage: post.codeLanguage,
        tags: post.tags,
        category: post.category,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        author: {
          id: post.author.id,
          name: post.author.name,
          avatarUrl: post.author.image || (post.author.githubUsername ? `https://github.com/${post.author.githubUsername}.png` : undefined),
          title: post.author.title || "Web Developer",
          location: post.author.location || "Indonesia",
          primaryStack: post.author.primaryStack || [],
        },
        project: post.project ? {
          id: post.project.id,
          title: post.project.title,
          stage: post.project.stage,
        } : null,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        bookmarkCount: post._count.bookmarks,
        isLiked,
        isBookmarked,
        isOwner: currentUserId === post.authorId,
        previewComments: post.comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt.toISOString(),
          author: {
            id: c.author.id,
            name: c.author.name,
            avatarUrl: c.author.image || (c.author.githubUsername ? `https://github.com/${c.author.githubUsername}.png` : undefined),
            title: c.author.title || "Developer",
          },
          likeCount: c.likes.length,
          isLiked: currentUserId ? c.likes.some((l) => l.userId === currentUserId) : false,
          isOwner: currentUserId === c.authorId,
          replies: c.replies.map((r) => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt.toISOString(),
            author: {
              id: r.author.id,
              name: r.author.name,
              avatarUrl: r.author.image || (r.author.githubUsername ? `https://github.com/${r.author.githubUsername}.png` : undefined),
              title: r.author.title || "Developer",
            },
            likeCount: r.likes.length,
            isLiked: currentUserId ? r.likes.some((l) => l.userId === currentUserId) : false,
            isOwner: currentUserId === r.authorId,
          })),
        })),
      };
    });

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/posts: Create a new community post
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      content,
      mediaUrls = [],
      codeSnippet,
      codeLanguage = "typescript",
      tags = [],
      category = "GENERAL",
      projectId,
    } = body;

    if (!content?.trim() && mediaUrls.length === 0 && !codeSnippet?.trim()) {
      return NextResponse.json(
        { error: "Postingan harus memiliki teks caption, gambar, atau snippet kode." },
        { status: 400 }
      );
    }

    // Auto extract hashtags from content if not provided
    const extractedTags = new Set<string>(tags);
    if (content) {
      const matches = content.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        matches.forEach((t: string) => extractedTags.add(t));
      }
    }

    const newPost = await prisma.post.create({
      data: {
        authorId: session.user.id,
        content: content?.trim() || "",
        mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
        codeSnippet: codeSnippet?.trim() || null,
        codeLanguage: codeSnippet?.trim() ? codeLanguage : null,
        tags: Array.from(extractedTags),
        category: category || "GENERAL",
        projectId: projectId || null,
      },
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
        project: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
        },
      },
    });

    const formatted = {
      id: newPost.id,
      content: newPost.content,
      mediaUrls: newPost.mediaUrls,
      codeSnippet: newPost.codeSnippet,
      codeLanguage: newPost.codeLanguage,
      tags: newPost.tags,
      category: newPost.category,
      createdAt: newPost.createdAt.toISOString(),
      updatedAt: newPost.updatedAt.toISOString(),
      author: {
        id: newPost.author.id,
        name: newPost.author.name,
        avatarUrl: newPost.author.image || (newPost.author.githubUsername ? `https://github.com/${newPost.author.githubUsername}.png` : undefined),
        title: newPost.author.title || "Web Developer",
        location: newPost.author.location || "Indonesia",
        primaryStack: newPost.author.primaryStack || [],
      },
      project: newPost.project ? {
        id: newPost.project.id,
        title: newPost.project.title,
        stage: newPost.project.stage,
      } : null,
      likeCount: 0,
      commentCount: 0,
      bookmarkCount: 0,
      isLiked: false,
      isBookmarked: false,
      isOwner: true,
      previewComments: [],
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
