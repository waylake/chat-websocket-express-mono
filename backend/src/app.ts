import express from "express";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import cors from "cors";
import { Database } from "./database";
import { UserController } from "./controllers/UserController";
import { ChatRoomController } from "./controllers/ChatRoomController";
import { MessageController } from "./controllers/MessageController";
import dotenv from "dotenv";

dotenv.config();

declare module "express-session" {
  interface Session {
    userId: number;
  }
}

export class App {
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private db: Database;
  private sessionMiddleware: any;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CLIENT_URL, // 클라이언트 주소를 환경 변수로 가져옴
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
    this.db = new Database();
    this.initializeDatabase();
    this.config();
    this.routes();
    this.sockets();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.db.connect();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    }
  }

  private config(): void {
    this.sessionMiddleware = session({
      secret: process.env.SESSION_SECRET || "your_secret_key",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    });

    this.app.use(express.json());
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
      }),
    );
    this.app.use(this.sessionMiddleware);
  }

  private routes(): void {
    const userController = new UserController(this.db);
    const chatRoomController = new ChatRoomController(this.db);
    const messageController = new MessageController(this.db, this.io);

    this.app.use("/api/users", userController.router);
    this.app.use("/api/chatrooms", chatRoomController.router);
    this.app.use("/api/messages", messageController.router);
  }

  private sockets(): void {
    this.io.use((socket, next) => {
      this.sessionMiddleware(socket.request as any, {} as any, next as any);
    });

    this.io.on("connection", (socket) => {
      console.log("A user connected");

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

  public async start(port: number): Promise<void> {
    await this.initializeDatabase();
    this.server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}
