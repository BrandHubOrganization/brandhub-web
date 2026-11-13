// scripts/seed-100-partners-all-agencies.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { VIETNAMESE_PARTNERS_RAW } from "./generate-100-vietnamese-partners.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

async function main() {
  console.log(`Starting seed process for ${VIETNAMESE_PARTNERS_RAW.length} partners...`);

  // 1. Fetch all agencies
  const agenciesOutput = execSync(
    'docker exec -e PGPASSWORD=root brandhub-postgres psql -U brandhub -d brandhub -t -A -F"," -c "SELECT id, owner_id, name FROM agencies ORDER BY name;"',
    { encoding: "utf-8" }
  );

  const agencies = agenciesOutput
    .trim()
    .split("\n")
    .map((line) => {
      const [id, ownerId, name] = line.split(",");
      return { id: id?.trim(), ownerId: ownerId?.trim(), name: name?.trim() };
    })
    .filter((a) => a.id && a.ownerId);

  console.log(`Found ${agencies.length} agencies in database.`);

  const sqlStatements = [];
  sqlStatements.push("BEGIN;");

  for (const agency of agencies) {
    const valueTuples = VIETNAMESE_PARTNERS_RAW.map((partner) => {
      const contactInfoJson = JSON.stringify({
        contactName: partner.contactName,
        phone: partner.phone,
        email: partner.email,
        website: partner.website,
      });

      return `(
        ${escapeSql(agency.id)}::uuid,
        ${escapeSql(partner.name)},
        ${escapeSql(partner.type)},
        ${escapeSql(contactInfoJson)},
        ${escapeSql(partner.notes)},
        ${escapeSql(agency.ownerId)}::uuid
      )`;
    });

    // Chunk into 50 values per statement to prevent giant queries
    const chunkSize = 50;
    for (let i = 0; i < valueTuples.length; i += chunkSize) {
      const chunk = valueTuples.slice(i, i + chunkSize);
      const valuesClause = chunk.join(",\n");

      // 1) Update existing partners with rich text and full contact info
      sqlStatements.push(`
UPDATE third_party_collaborators t
SET contact_info = v.contact_info::jsonb,
    notes = v.notes,
    partner_type = v.partner_type::collaborator_type,
    is_active = true,
    updated_at = NOW()
FROM (VALUES
${valuesClause}
) AS v(agency_id, partner_name, partner_type, contact_info, notes, created_by)
WHERE t.agency_id = v.agency_id AND t.partner_name = v.partner_name;
      `);

      // 2) Insert new partners
      sqlStatements.push(`
INSERT INTO third_party_collaborators (
  id, agency_id, partner_name, partner_type, contact_info, notes,
  is_active, usage_history_verified, version, created_by, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  v.agency_id,
  v.partner_name,
  v.partner_type::collaborator_type,
  v.contact_info::jsonb,
  v.notes,
  true,
  false,
  0,
  v.created_by,
  NOW(),
  NOW()
FROM (VALUES
${valuesClause}
) AS v(agency_id, partner_name, partner_type, contact_info, notes, created_by)
WHERE NOT EXISTS (
  SELECT 1 FROM third_party_collaborators t
  WHERE t.agency_id = v.agency_id AND t.partner_name = v.partner_name
);
      `);
    }
  }

  sqlStatements.push("COMMIT;");

  const sqlFilePath = path.join(__dirname, "seed-100-partners.sql");
  fs.writeFileSync(sqlFilePath, sqlStatements.join("\n"), "utf-8");
  console.log(`Wrote SQL file to ${sqlFilePath} (${(fs.statSync(sqlFilePath).size / 1024 / 1024).toFixed(2)} MB).`);

  // Execute in PostgreSQL container
  console.log("Executing SQL in Postgres container...");
  execSync(
    `docker exec -i -e PGPASSWORD=root brandhub-postgres psql -U brandhub -d brandhub < "${sqlFilePath}"`,
    { stdio: "inherit", shell: "cmd.exe" }
  );

  console.log("Execution finished. Verifying counts...");
  const countOutput = execSync(
    'docker exec -e PGPASSWORD=root brandhub-postgres psql -U brandhub -d brandhub -c "SELECT COUNT(*) AS total_partners, COUNT(DISTINCT agency_id) AS total_agencies FROM third_party_collaborators;"',
    { encoding: "utf-8" }
  );
  console.log(countOutput);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
