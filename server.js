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

        // Emit message payload to receiver
        io.to(`user:${receiverId}`).emit("new_message", formatted);

        // Also emit real-time chat notification with toast pop-up to receiver
        const chatNotif = {
          id: `chat-${newMessage.id}`,
          type: "MESSAGE",
          title: `💬 Pesan Baru dari ${senderName || "Teman Ngoding"}`,
          message: content.length > 70 ? content.slice(0, 70) + "..." : content,
          actorId: senderId,
          actorName: senderName || "Teman Ngoding",
          linkUrl: `/messages?userId=${senderId}`,
          read: false,
          createdAt: "Baru saja",
          timestamp: Date.now(),
        };
        io.to(`user:${receiverId}`).emit("new_notification", chatNotif);

        // Also emit back to all other tabs of sender
        socket.to(`user:${senderId}`).emit("new_message", formatted);

        if (callback) callback({ success: true, message: formatted });
      } catch (err) {
        console.error("Socket send_message error:", err);
        if (callback) callback({ error: "Failed to send message" });
      }
    });

    // 5. Send Real-Time Profile Like Event
    socket.on("send_like", async ({ senderId, senderName, senderAvatar, senderRole, receiverId }) => {
      try {
        if (!senderId || !receiverId) return;

        const notifPayload = {
          id: `like-${senderId}-${Date.now()}`,
          type: "LIKE",
          title: "Menyukai Profil Kamu!",
          message: `${senderName || "Seorang Developer"} (${senderRole || "Developer"}) baru saja menyukai profilmu! Geser kanan untuk auto-match.`,
          actorId: senderId,
          actorName: senderName || "Developer",
          actorAvatar: senderAvatar,
          actorRole: senderRole || "Developer",
          linkUrl: "/matches",
          read: false,
          createdAt: "Baru saja",
        };

        // Emit instant notification to receiver room
        io.to(`user:${receiverId}`).emit("new_notification", notifPayload);
        io.to(`user:${receiverId}`).emit("profile_liked", {
          senderId,
          senderName,
          senderAvatar,
          senderRole,
        });
      } catch (err) {
        console.error("Socket send_like error:", err);
      }
    });

    // 6. Send Real-Time Mutual Match Event
    socket.on("send_match", async ({ user1Id, user2Id, user1Name, user1Avatar, user2Name, user2Avatar }) => {
      try {
        if (!user1Id || !user2Id) return;

        const notifForUser2 = {
          id: `match-${user1Id}-${Date.now()}`,
          type: "MATCH",
          title: "Yeay, Match Baru Terbentuk!",
          message: `Kamu dan ${user1Name || "Partner"} saling menyukai! Mulai obrolan untuk berkolaborasi.`,
          actorId: user1Id,
          actorName: user1Name,
          actorAvatar: user1Avatar,
          linkUrl: `/messages?userId=${user1Id}`,
          read: false,
          createdAt: "Baru saja",
        };

        const notifForUser1 = {
          id: `match-${user2Id}-${Date.now()}`,
          type: "MATCH",
          title: "Yeay, Match Baru Terbentuk!",
          message: `Kamu dan ${user2Name || "Partner"} saling menyukai! Mulai obrolan untuk berkolaborasi.`,
          actorId: user2Id,
          actorName: user2Name,
          actorAvatar: user2Avatar,
          linkUrl: `/messages?userId=${user2Id}`,
          read: false,
          createdAt: "Baru saja",
        };

        io.to(`user:${user2Id}`).emit("new_notification", notifForUser2);
        io.to(`user:${user1Id}`).emit("new_notification", notifForUser1);
      } catch (err) {
        console.error("Socket send_match error:", err);
      }
    });

    // 7. Send Real-Time Project Application Accepted (ACC) Notification Event
    socket.on("send_project_acc", async ({ ownerId, ownerName, ownerAvatar, applicantId, projectTitle, roleTitle }) => {
      try {
        if (!applicantId) return;

        const notifPayload = {
          id: `project-acc-${applicantId}-${Date.now()}`,
          type: "PROJECT_INVITE",
          title: "🎉 Lamaran Proyek Diterima (ACC)!",
          message: `Selamat! Pengajuan kamu untuk peran "${roleTitle || "Developer"}" di proyek "${projectTitle || "Proyek"}" telah DITERIMA oleh ${ownerName || "Pemilik Proyek"}. Kamu resmi bergabung!`,
          actorId: ownerId,
          actorName: ownerName || "Pemilik Proyek",
          actorAvatar: ownerAvatar,
          linkUrl: "/projects?tab=applications",
          read: false,
          createdAt: "Baru saja",
        };

        io.to(`user:${applicantId}`).emit("new_notification", notifPayload);
        io.to(`user:${applicantId}`).emit("project_accepted", {
          ownerId,
          ownerName,
          projectTitle,
          roleTitle,
        });
      } catch (err) {
        console.error("Socket send_project_acc error:", err);
      }
    });

    // 8. Send Real-Time Incoming Join Request Notification Event
    socket.on("send_project_apply", async ({ applicantId, applicantName, applicantAvatar, applicantRole, ownerId, projectTitle, roleTitle }) => {
      try {
        if (!ownerId) return;

        const notifPayload = {
          id: `project-apply-${applicantId}-${Date.now()}`,
          type: "PROJECT_INVITE",
          title: "📥 Lamaran Proyek Masuk!",
          message: `${applicantName || "Developer"} (${applicantRole || "Developer"}) mengajukan diri untuk peran "${roleTitle || "Developer"}" di proyek "${projectTitle || "Proyek"}".`,
          actorId: applicantId,
          actorName: applicantName || "Developer",
          actorAvatar: applicantAvatar,
          actorRole: applicantRole || "Developer",
          linkUrl: "/projects?tab=my-projects",
          read: false,
          createdAt: "Baru saja",
        };

        io.to(`user:${ownerId}`).emit("new_notification", notifPayload);
      } catch (err) {
        console.error("Socket send_project_apply error:", err);
      }
    });

    // 9. Disconnect handling
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
