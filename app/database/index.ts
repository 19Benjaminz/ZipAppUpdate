import * as SQLite from 'expo-sqlite';

// Database name
const DATABASE_NAME = 'zippora.db';

// Open database connection
export const openDatabase = (): SQLite.SQLiteDatabase => {
  const db = SQLite.openDatabaseSync(DATABASE_NAME);
  return db;
};

// Initialize database with tables
export const initializeDatabase = (): void => {
  const db = openDatabase();
  
  // Create tables
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT UNIQUE NOT NULL,
      access_token TEXT,
      user_data TEXT,
      updated_at INTEGER NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS apartment_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      apartment_id TEXT NOT NULL,
      apartment_data TEXT,
      updated_at INTEGER NOT NULL,
      UNIQUE(member_id, apartment_id)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS zippora_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      zippora_list TEXT,
      updated_at INTEGER NOT NULL,
      UNIQUE(member_id)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS logs_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id TEXT NOT NULL,
      logs_data TEXT,
      updated_at INTEGER NOT NULL,
      UNIQUE(member_id)
    );
  `);

  console.log('Database initialized successfully');
};

// Get current timestamp
export const getCurrentTimestamp = (): number => {
  return Math.floor(Date.now() / 1000);
};

// Check if cached data is still valid (default: 5 minutes)
export const isCacheValid = (updatedAt: number, maxAgeInSeconds: number = 300): boolean => {
  const currentTime = getCurrentTimestamp();
  return (currentTime - updatedAt) < maxAgeInSeconds;
};
