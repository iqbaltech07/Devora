import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socket/io",
      autoConnect: false,
      reconnection: false,
      timeout: 4000,
      transports: ["websocket"],
    });
  }
  return socket;
}
