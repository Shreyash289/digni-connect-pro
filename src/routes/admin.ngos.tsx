import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/ngos", label: "NGO approvals" },
  { to: "/admin/recruiters", label: "Recruiters" },
  { to: "/admin/requests", label: "Requests" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/analytics", label: "Analytics" },
];

export const Route = createFileRoute("/admin/ngos")({
  head: () => ({ meta: [{ title: "NGO approvals · CAREVIA" }] }),
  component: AdminNgos,
});

function AdminNgos() {
  return (
    <PortalShell title="Admin" nav={ADMIN_NAV} allow={["admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

type Ngo = {
  id: string;
  name: string;
  status: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  registration_number: string | null;
  description: string | null;
  created_at: string;
  rejection_reason: string | null;
};

function Inner() {
  const qc = useQueryClient();
  const [rejectFor, setRejectFor] = useState<Ngo | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-ngos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Ngo[];
    },
  });

  const approve = useMutation({
    mutationFn: async (n: Ngo) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("ngos")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: u.user?.id,
          rejection_reason: null,
        })
        .eq("id", n.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("NGO approved");
      qc.invalidateQueries({ queryKey: ["admin-ngos"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: async () => {
      if (!rejectFor) return;
      const { error } = await supabase
        .from("ngos")
        .update({ status: "rejected", rejection_reason: reason || "Not approved" })
        .eq("id", rejectFor.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("NGO rejected");
      setRejectFor(null);
      setReason("");
      qc.invalidateQueries({ queryKey: ["admin-ngos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  const pending = data?.filter((n) => n.status === "pending") ?? [];
  const others = data?.filter((n) => n.status !== "pending") ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-primary">NGO approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review NGO partner applications.</p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pending ({pending.length})
        </h2>
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nothing to review.
            </div>
          ) : (
            pending.map((n) => (
              <NgoCard
                key={n.id}
                ngo={n}
                actions={
                  <>
                    <Button size="sm" variant="outline" onClick={() => setRejectFor(n)} className="gap-1">
                      <X className="size-4" /> Reject
                    </Button>
                    <Button size="sm" disabled={approve.isPending} onClick={() => approve.mutate(n)} className="gap-1">
                      <Check className="size-4" /> Approve
                    </Button>
                  </>
                }
              />
            ))
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recently reviewed
          </h2>
          <div className="space-y-3">
            {others.slice(0, 20).map((n) => (
              <NgoCard key={n.id} ngo={n} />
            ))}
          </div>
        </section>
      )}

      <Dialog open={!!rejectFor} onOpenChange={(o) => !o && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectFor?.name}?</DialogTitle>
            <DialogDescription>The NGO will see this reason on their dashboard.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason (optional)"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" disabled={reject.isPending} onClick={() => reject.mutate()}>
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NgoCard({ ngo, actions }: { ngo: Ngo; actions?: React.ReactNode }) {
  const tone =
    ngo.status === "approved"
      ? "bg-success/15 text-success"
      : ngo.status === "rejected"
        ? "bg-destructive/15 text-destructive"
        : "bg-warning/15 text-warning-foreground";
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-primary">{ngo.name}</h3>
          <Badge variant="secondary" className={tone}>{ngo.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {ngo.contact_email} {ngo.contact_phone ? `· ${ngo.contact_phone}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {[ngo.city, ngo.state, ngo.country].filter(Boolean).join(", ") || "—"}
          {ngo.registration_number ? ` · Reg ${ngo.registration_number}` : ""}
        </p>
        {ngo.description && <p className="mt-3 text-sm text-foreground/80">{ngo.description}</p>}
        {ngo.rejection_reason && (
          <p className="mt-2 text-xs text-destructive">Reason: {ngo.rejection_reason}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
