/**
 * Demo seed data script — run via service role against Supabase.
 * Usage: npx tsx scripts/seed.ts (requires SUPABASE_SERVICE_ROLE_KEY)
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false } });

async function seed() {
  console.log("Seeding CAREVIA demo data…");
  // Seed is idempotent-friendly: creates demo markers only when empty
  const { count } = await admin.from("survivors").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 5) {
    console.log("Database already has data, skipping seed.");
    return;
  }
  console.log("Run migrations first, then create users via Supabase Auth dashboard.");
  console.log("Target: 1 admin, 3 NGOs, 30 survivors, 5 recruiters, 10 jobs");
  console.log("Assign roles via user_roles and approve NGOs/recruiters in admin UI.");
}

seed().catch(console.error);
