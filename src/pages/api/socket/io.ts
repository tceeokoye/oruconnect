import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandler(req: NextApiRequest, res: NextApiResponse | any) {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      // User joins their own room based on their userId
      socket.on("join-user", (userId: string) => {
        socket.join(userId);
      });

      // User joins a specific conversation/job request room
      socket.on("join-chat", (chatId: string) => {
        socket.join(chatId);
      });

      // Send message event
      socket.on("send-message", (data: { chatId: string; message: any }) => {
        io.to(data.chatId).emit("new-message", data.message);
      });

      // Typing indicators
      socket.on("typing", (data: { chatId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.chatId).emit("typing", data);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
