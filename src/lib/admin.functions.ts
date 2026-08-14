import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminIntroRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Admin only");

    const { data, error } = await supabase
      .from("introduction_requests")
      .select(
        "*, survivors(anonymous_id,full_name), recruiters(company_name), ngos(name)",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

import { z } from "zod";
import crypto from "node:crypto";

export const requestAdminSignupRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      inviteCode: z.string().min(1, "Admin invite code is required"),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const expectedCode = process.env.ADMIN_SIGNUP_CODE;

    // Fail closed if server secret is not configured
    if (!expectedCode || expectedCode.trim() === "") {
      throw new Error("Admin registration is not configured or currently disabled.");
    }

    // Timing-safe comparison to prevent timing attacks
    const providedBuffer = Buffer.from(data.inviteCode.trim());
    const expectedBuffer = Buffer.from(expectedCode.trim());

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid admin invitation code. Admin access requires an authorized invitation.");
    }

    const { supabaseAdmin, supabase } = await import("@/integrations/supabase/client.server");

    // Check if user already has any role assigned
    const { data: existingRole, error: existingError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }
    if (existingRole) {
      throw new Error("A role is already assigned to this account.");
    }

    const { error: insertError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role: "admin",
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const { writeAudit } = await import("@/lib/audit.server");
    await writeAudit(supabase, {
      actorId: userId,
      action: "admin.signup_verified",
      entityType: "user_roles",
      metadata: { role: "admin" },
    });

    return { success: true };
  });

export const getAdminUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
    if (!isAdmin) throw new Error("Admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at");
    if (rolesError) throw new Error(rolesError.message);

    const adminClient = supabaseAdmin as any;
    const { data: usersPayload, error: usersError } = await adminClient.auth.admin.listUsers();
    if (usersError) throw new Error(usersError.message);

    const users = (usersPayload?.users ?? []) as Array<Record<string, any>>;
    const usersMap = new Map(users.map((user) => [user.id, user]));

    const grouped = Array.from(
      (roles ?? []).reduce((map, item) => {
        const existing = map.get(item.user_id) ?? {
          userId: item.user_id,
          email: usersMap.get(item.user_id)?.email ?? null,
          createdAt: usersMap.get(item.user_id)?.created_at ?? null,
          roles: [] as string[],
          roleAssignedAt: item.created_at,
        };

        if (!existing.email) existing.email = usersMap.get(item.user_id)?.email ?? existing.email;
        if (!existing.createdAt) existing.createdAt = usersMap.get(item.user_id)?.created_at ?? existing.createdAt;

        existing.roles.push(item.role);
        map.set(item.user_id, existing);
        return map;
      }, new Map<string, { userId: string; email: string | null; createdAt: string | null; roles: string[]; roleAssignedAt: string }>()),
    ).sort((a, b) => {
      const createdA = a.createdAt ?? "";
      const createdB = b.createdAt ?? "";
      return createdA < createdB ? 1 : createdA > createdB ? -1 : 0;
    });

    return grouped;
  });
