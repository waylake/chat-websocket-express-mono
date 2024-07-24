import { Router, Request, Response } from "express";
import { Database } from "../database";

export class ChatRoomController {
  public router: Router;
  private db: Database;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/", this.createChatRoom.bind(this));
    this.router.get("/", this.getChatRooms.bind(this));
    this.router.post("/:id/join", this.joinChatRoom.bind(this));
  }

  private async createChatRoom(req: Request, res: Response): Promise<void> {
    const { name, description, isPrivate } = req.body;
    const userId = req.session.userId;

    try {
      await this.db.run(
        "INSERT INTO chat_rooms (name, description, createdBy, isPrivate) VALUES (?, ?, ?, ?)",
        [name, description, userId, isPrivate],
      );
      res.status(201).json({ message: "Chat room created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error creating chat room" });
    }
  }

  private async getChatRooms(req: Request, res: Response): Promise<void> {
    try {
      const chatRooms = await this.db.query(
        "SELECT * FROM chat_rooms WHERE isPrivate = 0",
      );
      res.json(chatRooms);
    } catch (error) {
      res.status(500).json({ error: "Error fetching chat rooms" });
    }
  }

  private async joinChatRoom(req: Request, res: Response): Promise<void> {
    const chatRoomId = req.params.id;
    const userId = req.session.userId;

    try {
      await this.db.run(
        "INSERT INTO chat_room_members (userId, chatRoomId, role) VALUES (?, ?, ?)",
        [userId, chatRoomId, "member"],
      );
      res.json({ message: "Joined chat room successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error joining chat room" });
    }
  }
}
