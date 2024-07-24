import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { Database } from "../database";

export class UserController {
  public router: Router;
  private db: Database;

  constructor(db: Database) {
    this.router = Router();
    this.db = db;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/register", this.register.bind(this));
    this.router.post("/login", this.login.bind(this));
  }

  private async register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.db.run(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
      );
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Error registering user" });
    }
  }

  private async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    try {
      console.log("Login attempt for username:", username); // 디버깅용 로그

      const users = await this.db.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
      );

      console.log("Query result:", users); // 디버깅용 로그

      if (!users || users.length === 0) {
        console.log("User not found"); // 디버깅용 로그
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const user = users[0];

      if (!user.password) {
        console.log("User found but password is missing"); // 디버깅용 로그
        res.status(500).json({ error: "User data is corrupted" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        req.session.userId = user.id;
        res.json({ message: "Login successful" });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error during login" });
    }
  }
}
