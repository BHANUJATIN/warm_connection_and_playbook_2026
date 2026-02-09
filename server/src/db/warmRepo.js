// warmRepo.js

import { pool } from "./index.js";
import { v4 as uuid } from "uuid";

export async function upsertWarmConnection(row) {
  const {
    prospect_domain,
    prospect_company_name,
    prospect_company_linkedin,
    prospect_person_name,
    prospect_person_first_name,
    prospect_person_last_name,
    prospect_person_linkedin,
    exa_person_linkedin,
    connection_type,
    summary,
    source
  } = row;

  await pool.query(
    `
    INSERT INTO warm_connections (
      id,
      prospect_domain,
      prospect_company_name,
      prospect_company_linkedin,
      prospect_person_name,
      prospect_person_first_name,
      prospect_person_last_name,
      prospect_person_linkedin,
      exa_person_linkedin,
      connection_type,
      summary,
      source
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    ON CONFLICT (
      prospect_domain,
      prospect_person_linkedin,
      exa_person_linkedin
    )
    DO UPDATE SET
      connection_type = EXCLUDED.connection_type,
      summary = EXCLUDED.summary,
      updated_at = NOW()
    `,
    [
      uuid(),
      prospect_domain,
      prospect_company_name,
      prospect_company_linkedin,
      prospect_person_name,
      prospect_person_first_name,
      prospect_person_last_name,
      prospect_person_linkedin,
      exa_person_linkedin,
      connection_type,
      summary,
      source
    ]
  );
}

export async function hasWarmConnections(domain) {
  const { rows } = await pool.query(
    `
    SELECT 1
    FROM warm_connections
    WHERE prospect_domain = $1
    LIMIT 1
    `,
    [domain]
  );

  return rows.length > 0;
}

export async function getWarmConnections(domain) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM warm_connections
    WHERE prospect_domain = $1
    ORDER BY created_at DESC
    `,
    [domain]
  );

  return rows;
}
