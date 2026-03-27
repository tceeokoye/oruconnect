import { NextApiRequest, NextApiResponse } from "next";

export default function emitHandler(req: NextApiRequest, res: NextApiResponse | any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const io = res.socket?.server?.io;
  
  if (!io) {
    return res.status(500).json({ message: "Socket.io not initialized" });
  }
  
  const { event, roomId, data } = req.body;
  if (!event || !roomId || !data) {
    return res.status(400).json({ message: "Missing event, roomId, or data" });
  }

  io.to(roomId).emit(event, data);
  
  res.status(200).json({ success: true });
}
