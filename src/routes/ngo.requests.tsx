import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./ngo.dashboard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { respondToIntroduction } from "@/lib/recruiters.functions";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/requests", label: "Intro requests" },
  { to: "/ngo/analytics", label: "Analytics" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/requests")({
  head: () => ({ meta: [{ title: "Introduction requests · CAREVIA" }] }),
  component: NgoRequests,
});

function NgoRequests() {
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: ngo } = useQuery({
    queryKey: ["my-ngo", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("ngos").select("id").eq("owner_id", user!.id).single();
      return data;
    },
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["ngo-intro-requests", ngo?.id],
    enabled: !!ngo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("introduction_requests")
        .select("*, survivors(anonymous_id, full_name), recruiters(company_name)")
        .eq("ngo_id", ngo!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const respond = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: "accepted" | "declined"; note?: string }) =>
      respondToIntroduction({ data: { id, status, note } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ngo-intro-requests"] });
      toast.success("Response sent");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Introduction requests</h1>
      <p className="text-sm text-muted-foreground">Review recruiter requests before sharing survivor contact details.</p>

      {!requests?.length ? (
        <p className="text-sm text-muted-foreground">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} onRespond={(status, note) => respond.mutate({ id: r.id, status, note })} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request: r,
  onRespond,
}: {
  request: {
    id: string; status: string; message: string; created_at: string;
    survivors: { anonymous_id: string; full_name: string } | null;
    recruiters: { company_name: string } | null;
  };
  onRespond: (status: "accepted" | "declined", note?: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{r.survivors?.full_name} ({r.survivors?.anonymous_id})</p>
          <p className="text-sm text-muted-foreground">From: {r.recruiters?.company_name}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <p className="mt-3 text-sm">{r.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
      {r.status === "pending" && (
        <div className="mt-4 space-y-2">
          <Textarea rows={2} placeholder="Optional note to recruiter…" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onRespond("accepted", note)}>Accept</Button>
            <Button size="sm" variant="outline" onClick={() => onRespond("declined", note)}>Decline</Button>
          </div>
        </div>
      )}
    </div>
  );
}
