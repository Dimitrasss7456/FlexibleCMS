import * as schema from "@shared/schema";

// For now, keep the database disabled and use the MemStorage fallback
// This ensures the app works without requiring PostgreSQL setup
let db: any = null;
let pool: any = null;

// Enable database when DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { drizzle } = require('drizzle-orm/neon-serverless');
    const ws = require("ws");
    
    neonConfig.webSocketConstructor = ws;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    pool = null;
  }
}

export { db, pool };