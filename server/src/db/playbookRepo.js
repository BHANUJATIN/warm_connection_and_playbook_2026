import { pool } from "./index.js";
import { v4 as uuid } from "uuid";

export async function getPlaybook(domain) {
  const { rows } = await pool.query(
    `
    SELECT data
    FROM email_playbooks
    WHERE prospect_domain = $1
    `,
    [domain]
  );

  return rows[0] || null;
}

export async function hasPlaybook(domain) {
  const { rows } = await pool.query(
    `
    SELECT 1
    FROM email_playbooks
    WHERE prospect_domain = $1
    LIMIT 1
    `,
    [domain]
  );

  return rows.length > 0;
}

export async function upsertPlaybook(domain, data) {
  await pool.query(
    `
    INSERT INTO email_playbooks (
      id,
      prospect_domain,
      data,
      source
    )
    VALUES ($1, $2, $3, 'ai')
    ON CONFLICT (prospect_domain)
    DO UPDATE SET
      data = EXCLUDED.data
    `,
    [uuid(), domain, data]
  );
}
