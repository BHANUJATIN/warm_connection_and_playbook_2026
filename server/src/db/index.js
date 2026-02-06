import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL

});
console.log(process.env.DATABASE_URL);

pool.on("connect", () => {
  console.log("Postgres connected");
});
