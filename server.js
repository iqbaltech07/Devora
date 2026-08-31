import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

// In-memory mapping: userId -> Set of socketIds
const userSockets = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socket/io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    let currentUserId = null;

    // 1. User registers/joins socket session with userId
    socket.on("register", ({ userId, userName }) => {
      if (!userId) return;
      currentUserId = userId;

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Join user's private room
      socket.join(`user:${userId}`);

      // Broadcast updated online presence list
      const onlineUserIds = Array.from(userSockets.keys());
      io.emit("presence_update", { onlineUserIds });
    });

    // 2. Typing indicator event
    socket.on("typing", ({ senderId, receiverId, isTyping }) => {
      if (!receiverId) return;
      io.to(`user:${receiverId}`).emit("user_typing", {
        senderId,
        isTyping,
      });
    });

    // 3. Mark messages as read event
    socket.on("mark_read", async ({ readerId, senderId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId,
            receiverId: readerId,
            read: false,
          },
          data: { read: true },
        });

        // Notify the original sender that their messages were read
        io.to(`user:${senderId}`).emit("messages_read", {
          readerId,
        });
      } catch (err) {
        console.error("Socket mark_read error:", err);
      }
    });

    // 4. Send Message via Socket with persistence
    socket.on("send_message", async ({ senderId, senderName, receiverId, content }, callback) => {
      try {
        if (!senderId || !receiverId || !content?.trim()) {
          if (callback) callback({ error: "Invalid payload" });
          return;
        }

        const newMessage = await prisma.message.create({
          data: {
            senderId,
            receiverId,
            content: content.trim(),
            read: false,
          },
        });

        const formatted = {
          id: newMessage.id,
          conversationId: receiverId,
          senderId: newMessage.senderId,
          senderName: senderName || "Developer",
          content: newMessage.content,
          read: false,
          sentAt: newMessage.createdAt instanceof Date ? newMessage.createdAt.toISOString() : String(newMessage.createdAt),
        };

        // Emit to receiver
        io.to(`user:${receiverId}`).emit("new_message", formatted);

        // Also emit back to all other tabs of sender
        socket.to(`user:${senderId}`).emit("new_message", formatted);

        if (callback) callback({ success: true, message: formatted });
      } catch (err) {
        console.error("Socket send_message error:", err);
        if (callback) callback({ error: "Failed to send message" });
      }
    });

    // 5. Disconnect handling
    socket.on("disconnect", () => {
      if (currentUserId && userSockets.has(currentUserId)) {
        const set = userSockets.get(currentUserId);
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(currentUserId);
        }
        const onlineUserIds = Array.from(userSockets.keys());
        io.emit("presence_update", { onlineUserIds });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Devora Server with Socket.IO running on http://${hostname}:${port}`);
  });
});
