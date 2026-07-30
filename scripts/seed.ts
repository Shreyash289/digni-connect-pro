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

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const ADMIN_EMAIL = "shreym171@gmail.com";
const ADMIN_NAME = "Shreyash";
const ADMIN_PASSWORD = "Anshu06@";

async function seed() {
  console.log("Seeding CAREVIA demo data…");

  const { data: existingAdminUser, error: userError } = await admin
    .from("auth.users")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .maybeSingle();

  if (userError) {
    console.error("Unable to query auth.users:", userError.message);
    process.exit(1);
  }

  let adminUserId = existingAdminUser?.id;
  if (!adminUserId) {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: ADMIN_NAME },
    });

    if (createError) {
      console.error("Unable to create admin user:", createError.message);
      process.exit(1);
    }

    adminUserId = created.user?.id;
    if (!adminUserId) {
      console.error("Admin user was created but no id was returned.");
      process.exit(1);
    }

    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  } else {
    console.log(`Found existing admin user: ${ADMIN_EMAIL}`);
  }

  const { data: existingRole, error: roleError } = await admin
    .from("user_roles")
    .select("id")
    .eq("user_id", adminUserId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("Unable to query user_roles:", roleError.message);
    process.exit(1);
  }

  if (!existingRole) {
    const { error: insertError } = await admin.from("user_roles").insert({
      user_id: adminUserId,
      role: "admin",
    });
    if (insertError) {
      console.error("Unable to assign admin role:", insertError.message);
      process.exit(1);
    }
    console.log(`Assigned admin role to ${ADMIN_EMAIL}`);
  } else {
    console.log(`Admin role already assigned to ${ADMIN_EMAIL}`);
  }

  console.log("Seed complete. You can now sign in with the seeded admin account.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
