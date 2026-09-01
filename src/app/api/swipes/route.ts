import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const swipedId = body.swipedId || body.targetUserId;
    const direction = body.direction;
    const swiperId = session.user.id;

    if (!swipedId || !direction) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Check if already matched to prevent redundant love/match actions
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: swiperId, user2Id: swipedId },
          { user1Id: swipedId, user2Id: swiperId },
        ],
      },
    });

    if (existingMatch) {
      return NextResponse.json({
        success: true,
        isMatch: true,
        matched: true,
        alreadyMatched: true,
        message: "Pengguna ini sudah menjadi partner cocok kamu.",
      });
    }

    // 2. Create or update the Swipe record
    try {
      await prisma.swipe.upsert({
        where: {
          swiperId_swipedId: {
            swiperId,
            swipedId,
          },
        },
        create: {
          swiperId,
          swipedId,
          direction,
        },
        update: {
          direction,
        },
      });
    } catch (swipeCreateError: any) {
      console.warn("Swipe upsert error, attempting fallback create:", swipeCreateError);
      try {
        await prisma.swipe.create({
          data: {
            swiperId,
            swipedId,
            direction,
          },
        });
      } catch (fallbackError: any) {
        if (fallbackError.code !== "P2002") {
          throw fallbackError;
        }
      }
    }

    let isMatch = false;

    // 3. Check for a Mutual Match if swiped RIGHT
    if (direction === "RIGHT") {
      const mutualSwipe = await prisma.swipe.findFirst({
        where: {
          swiperId: swipedId,
          swipedId: swiperId,
          direction: "RIGHT",
        },
      });

      if (mutualSwipe) {
        // Double check no match exists before creation
        const doubleCheck = await prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: swiperId, user2Id: swipedId },
              { user1Id: swipedId, user2Id: swiperId },
            ],
          },
        });

        if (!doubleCheck) {
          try {
            await prisma.match.create({
              data: {
                user1Id: swiperId,
                user2Id: swipedId,
              },
            });
          } catch (matchCreateErr) {
            console.warn("Prisma match create warning:", matchCreateErr);
          }
        }
        isMatch = true;

        // Invalidate Matches Cache for both users
        try {
          await Promise.all([
            redis.del(`matches:${swiperId}`),
            redis.del(`matches:${swipedId}`),
          ]);
        } catch (cacheDelErr) {
          console.warn("Redis DEL matches error:", cacheDelErr);
        }
      }
    }

    // 4. Invalidate Candidates Cache for both users
    try {
      await Promise.all([
        redis.del(`candidates:${swiperId}`),
        redis.del(`candidates:${swipedId}`),
      ]);
    } catch (cacheDelErr) {
      console.warn("Redis DEL candidates error:", cacheDelErr);
    }

    return NextResponse.json({ success: true, isMatch, matched: isMatch });
  } catch (error: any) {
    console.error("POST /api/swipes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const swiperId = session.user.id;
    await prisma.swipe.deleteMany({
      where: { swiperId },
    });

    await redis.del(`candidates:${swiperId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/swipes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
