import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PortalShell } from "@/components/layout/PortalShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getNotificationPreferences, updateNotificationPreference } from "@/lib/notifications.functions";

const SETTINGS_NAV = [{ to: "/settings/notifications", label: "Notifications" }];

const NOTIFICATION_KINDS = [
  { kind: "intro_request_received", label: "Introduction requests" },
  { kind: "intro_request_responded", label: "Introduction responses" },
  { kind: "job_application_received", label: "Job applications" },
  { kind: "application_status_changed", label: "Application status changes" },
  { kind: "ngo_approved", label: "NGO approval" },
  { kind: "recruiter_verified", label: "Recruiter verification" },
  { kind: "mentor_safety_flag", label: "Safety alerts" },
  { kind: "weekly_digest", label: "Weekly digest" },
];

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({ meta: [{ title: "Notification settings · CAREVIA" }] }),
  component: NotificationSettings,
});

function NotificationSettings() {
  return (
    <PortalShell
      title="Settings"
      nav={SETTINGS_NAV}
      allow={["ngo_partner", "recruiter", "survivor", "admin", "super_admin"]}
    >
      <Inner />
    </PortalShell>
  );
}

function Inner() {
  const qc = useQueryClient();
  const { data: prefs, isLoading } = useQuery({
    queryKey: ["notification-prefs"],
    queryFn: () => getNotificationPreferences(),
  });

  const update = useMutation({
    mutationFn: (p: { kind: string; in_app: boolean; email: boolean }) =>
      updateNotificationPreference({ data: p }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-prefs"] });
      toast.success("Preference saved");
    },
  });

  if (isLoading) return <Loader2 className="size-6 animate-spin" />;

  function getPref(kind: string) {
    return prefs?.find((p) => p.kind === kind) ?? { in_app: true, email: true };
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-primary">Notification preferences</h1>
      <div className="space-y-4">
        {NOTIFICATION_KINDS.map(({ kind, label }) => {
          const pref = getPref(kind);
          return (
            <div key={kind} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-medium">{label}</p>
              <div className="mt-3 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${kind}-in-app`}
                    checked={pref.in_app}
                    onCheckedChange={(v) => update.mutate({ kind, in_app: v, email: pref.email })}
                  />
                  <Label htmlFor={`${kind}-in-app`}>In-app</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${kind}-email`}
                    checked={pref.email}
                    onCheckedChange={(v) => update.mutate({ kind, in_app: pref.in_app, email: v })}
                  />
                  <Label htmlFor={`${kind}-email`}>Email</Label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
