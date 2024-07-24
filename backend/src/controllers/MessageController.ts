import { Router, Request, Response } from "express";
import { Server, Socket } from "socket.io";
import { Database } from "../database";

interface User {
  username: string;
}

export class MessageController {
  public router: Router;
  private db: Database;
  private io: Server;

  constructor(db: Database, io: Server) {
    this.router = Router();
    this.db = db;
    this.io = io;
    this.initializeRoutes();
    this.initializeSocket();
  }

  private initializeRoutes(): void {
    this.router.post("/", this.sendMessage.bind(this));
    this.router.get("/:chatRoomId", this.getMessages.bind(this));
  }

  private initializeSocket(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log("A user connected");

      socket.on("send message", this.handleSendMessage.bind(this, socket));

      socket.on("join room", (roomId) => {
        socket.join(roomId.toString());
      });

      socket.on("leave room", (roomId) => {
        socket.leave(roomId.toString());
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }

  private async handleSendMessage(
    socket: Socket,
    message: { content: string; chatRoomId: number },
  ) {
    const userId = (socket.request as any).session.userId;

    if (userId === undefined) {
      socket.emit("error", "User not authenticated");
      return;
    }

    try {
      const result = await this.db.run(
        "INSERT INTO messages (content, userId, chatRoomId) VALUES (?, ?, ?)",
        [message.content, userId, message.chatRoomId],
      );
      const users = await this.db.query<User>(
        "SELECT username FROM users WHERE id = ?",
        [userId],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const newMessage = {
        id: result.lastID,
        content: message.content,
        userId,
        chatRoomId: message.chatRoomId,
        username: users[0].username,
      };
      this.io.to(message.chatRoomId.toString()).emit("new message", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Error sending message");
    }
  }

  private async sendMessage(req: Request, res: Response): Promise<void> {
    const { content, chatRoomId } = req.body;
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    try {
      const result = await this.db.run(
        "INSERT INTO messages (content, userId, chatRoomId) VALUES (?, ?, ?)",
        [content, userId, chatRoomId],
      );
      const users = await this.db.query<User>(
        "SELECT username FROM users WHERE id = ?",
        [userId],
      );

      if (users.length === 0) {
        throw new Error("User not found");
      }

      const newMessage = {
        id: result.lastID,
        content,
        userId,
        chatRoomId,
        username: users[0].username,
      };
      this.io.to(chatRoomId.toString()).emit("new message", newMessage);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Error sending message" });
    }
  }

  private async getMessages(req: Request, res: Response): Promise<void> {
    const chatRoomId = req.params.chatRoomId;
    try {
      const messages = await this.db.query(
        `SELECT m.*, u.username 
         FROM messages m 
         JOIN users u ON m.userId = u.id 
         WHERE m.chatRoomId = ? 
         ORDER BY m.createdAt ASC`,
        [chatRoomId],
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Error fetching messages" });
    }
  }
}
