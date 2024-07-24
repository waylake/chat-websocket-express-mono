}mport sqlite3 from "sqlite3";
import { open, Database as SQLiteDatabase } from "sqlite";
import path from "path";

export class Database {
  private db: SQLiteDatabase | null = null;

  public async connect(): Promise<void> {
    try {
      this.db = await open({
        filename: path.join("/tmp", "database.sqlite"),
        driver: sqlite3.Database,
      });
      console.log("Database connected successfully");
      await this.createTables();
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error("Database not connected");
    }

    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS chat_rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        createdBy INTEGER,
        isPrivate BOOLEAN,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users (id)
      )`,
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        userId INTEGER,
        chatRoomId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (chatRoomId) REFERENCES chat_rooms (id)
      )`,
      `CREATE TABLE IF NOT EXISTS chat_room_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        chatRoomId INTEGER,
        role TEXT,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (chatRoomId) REFERENCES chat_rooms (id)
      )`,
    ];

    for (const query of queries) {
      await this.db.exec(query);
    }
    console.log("Tables created successfully");
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    return this.db.all<T[]>(sql, params);
  }

  public async run(
    sql: string,
    params: any[] = [],
  ): Promise<{ lastID: number; changes: number }> {
    if (!this.db) {
      throw new Error("Database not connected");
    }
    const result = await this.db.run(sql, params);
    return {
      lastID: result.lastID ?? 0,
      changes: result.changes ?? 0,
    };
  }
}
