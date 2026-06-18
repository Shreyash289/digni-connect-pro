import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./ngo.dashboard";
import { supabase } from "@/integrations/supabase/client";
import { verifyRecruiter } from "@/lib/recruiters.functions";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/ngos", label: "NGOs" },
  { to: "/admin/recruiters", label: "Recruiters" },
  { to: "/admin/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/admin/recruiters")({
  head: () => ({ meta: [{ title: "Recruiter verification · CAREVIA" }] }),
  component: AdminRecruiters,
});

function AdminRecruiters() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const qc = useQueryClient();

  const { data: recruiters, isLoading } = useQuery({
    queryKey: ["admin-recruiters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recruiters")
        .select("*, profiles:user_id(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const verify = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      verifyRecruiter({ data: { id, status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-recruiters"] });
      toast.success("Recruiter updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Recruiter verification</h1>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {(recruiters ?? []).map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{r.company_name}</p>
              <p className="text-sm text-muted-foreground">{r.company_website ?? "No website"}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={r.verification_status} />
              {r.verification_status === "pending" && (
                <>
                  <Button size="sm" onClick={() => verify.mutate({ id: r.id, status: "approved" })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => verify.mutate({ id: r.id, status: "rejected" })}>Reject</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
