import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("Postgres connected");
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});
