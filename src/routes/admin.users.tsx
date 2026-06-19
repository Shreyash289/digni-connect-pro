import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { getAdminUsers } from "@/lib/admin.functions";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/ngos", label: "NGO approvals" },
  { to: "/admin/recruiters", label: "Recruiters" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users · CAREVIA" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAdminUsers(),
  });

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-primary">Current users</h1>
        <p className="mt-1 text-sm text-muted-foreground">View user accounts and assigned roles across the platform.</p>
      </header>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[minmax(220px,_1.5fr)_1fr_1fr] gap-4 border-b border-border px-5 py-3 text-xs uppercase tracking-wide text-muted-foreground">
          <span>User</span>
          <span>Roles</span>
          <span>Joined</span>
        </div>
        {!data?.length ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No users found.</div>
        ) : (
          data.map((user: any) => (
            <div key={user.userId} className="grid grid-cols-[minmax(220px,_1.5fr)_1fr_1fr] gap-4 border-t border-border px-5 py-4 text-sm">
              <div>
                <p className="font-medium text-foreground">{user.email ?? user.userId}</p>
                <p className="text-xs text-muted-foreground">{user.userId}</p>
              </div>
              <div className="text-sm text-foreground">{(user.roles ?? []).join(", ")}</div>
              <div className="text-sm text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
