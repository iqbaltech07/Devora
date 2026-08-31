import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Send initial connected event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId, timestamp: new Date().toISOString() })}\n\n`)
      );

      let lastCheckedMessageId: string | null = null;

      // 2. Set up event loop (checks for incoming messages and presence every 500ms for ultra-low latency)
      const intervalId = setInterval(async () => {
        if (isClosed) {
          clearInterval(intervalId);
          return;
        }

        try {
          // Check for incoming messages in Redis queue for current user
          const rawItems = await redis.lrange(`chat:inbox:${userId}`, 0, 4);
          if (rawItems && rawItems.length > 0) {
            for (const item of rawItems) {
              const msg = typeof item === "string" ? JSON.parse(item) : item;
              if (msg && msg.id && msg.id !== lastCheckedMessageId) {
                lastCheckedMessageId = msg.id;
                controller.enqueue(
                  encoder.encode(`event: message\ndata: ${JSON.stringify(msg)}\n\n`)
                );
              }
            }
          }

          // Send keep-alive ping
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch (err) {
          console.warn("SSE stream polling warning:", err);
        }
      }, 500);

      // Cleanup on client disconnect
      request.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(intervalId);
        try {
          controller.close();
        } catch (_) {}
      });
    },
    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
