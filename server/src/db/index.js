import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: 'postgresql://postgres.ukislwzdnjpwxfkggggl:mXYjKf5Sz0FcJaV0@aws-1-eu-central-1.pooler.supabase.com:6543/postgres'

});
console.log(process.env.DATABASE_URL);

pool.on("connect", () => {
  console.log("Postgres connected");
});
