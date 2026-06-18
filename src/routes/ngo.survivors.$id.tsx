import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, FileText, Trash2, CheckCircle2 } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  getSurvivorDetail,
  updateSurvivorProfile,
  uploadSurvivorDocument,
  deleteSurvivorDocument,
  getSignedDocumentUrl,
  searchSkillsTaxonomy,
} from "@/lib/survivors.functions";
import { getMatchScoresForSurvivor } from "@/lib/matcher.functions";
import { StatusBadge } from "./ngo.dashboard";

const NGO_NAV = [
  { to: "/ngo/dashboard", label: "Dashboard" },
  { to: "/ngo/survivors", label: "Survivors" },
  { to: "/ngo/requests", label: "Intro requests" },
  { to: "/ngo/analytics", label: "Analytics" },
  { to: "/ngo/organization", label: "Organization" },
];

export const Route = createFileRoute("/ngo/survivors/$id")({
  head: () => ({ meta: [{ title: "Survivor profile · CAREVIA" }] }),
  component: SurvivorEditor,
});

const profileSchema = z.object({
  pronouns: z.string().optional(),
  bio: z.string().max(2000).optional(),
  location_country: z.string().optional(),
  location_region: z.string().optional(),
  languages: z.string().optional(),
  skills: z.string().optional(),
  availability: z.string().optional(),
  consent_share_with_recruiters: z.boolean(),
  consent_ai_processing: z.boolean(),
});

type ProfileForm = z.infer<typeof profileSchema>;

function SurvivorEditor() {
  const { id } = Route.useParams();
  return (
    <PortalShell title="NGO Portal" nav={NGO_NAV} allow={["ngo_partner", "admin", "super_admin"]}>
      <EditorInner id={id} />
    </PortalShell>
  );
}

function EditorInner({ id }: { id: string }) {
  const qc = useQueryClient();

  const { data: survivor, isLoading } = useQuery({
    queryKey: ["survivor", id],
    queryFn: () => getSurvivorDetail({ data: { id } }),
  });

  const { data: jobMatches } = useQuery({
    queryKey: ["survivor-matches", id],
    enabled: !!survivor,
    queryFn: () => getMatchScoresForSurvivor({ data: { survivorId: id, topK: 5 } }),
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: survivor
      ? {
          pronouns: survivor.pronouns ?? "",
          bio: survivor.bio ?? "",
          location_country: survivor.location_country ?? survivor.country ?? "",
          location_region: survivor.location_region ?? survivor.state ?? "",
          languages: (survivor.languages ?? []).join(", "),
          skills: (survivor.skills ?? []).join(", "),
          availability: survivor.availability ?? "",
          consent_share_with_recruiters: survivor.consent_share_with_recruiters ?? false,
          consent_ai_processing: survivor.consent_ai_processing ?? false,
        }
      : undefined,
  });

  const save = useMutation({
    mutationFn: (patch: Record<string, unknown>) =>
      updateSurvivorProfile({ data: { id, patch: patch as Parameters<typeof updateSurvivorProfile>[0]["data"]["patch"] } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["survivor", id] });
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onBlurSave = useCallback(
    (fields: (keyof ProfileForm)[]) => {
      const values = form.getValues();
      const patch: Record<string, unknown> = {};
      for (const f of fields) {
        if (f === "languages" || f === "skills") {
          patch[f] = String(values[f])
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          patch[f] = values[f];
        }
      }
      save.mutate(patch);
    },
    [form, save],
  );

  if (isLoading) {
    return <div className="grid place-items-center py-24"><Loader2 className="size-6 animate-spin" /></div>;
  }
  if (!survivor) return <p>Survivor not found</p>;

  const docs = (survivor.survivor_documents ?? []).filter(
    (d: { status?: string }) => d.status !== "deleted",
  );
  const readyForRecruiters =
    survivor.consent_share_with_recruiters && survivor.profile_completion >= 60;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/ngo/survivors" className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to survivors
          </Link>
          <h1 className="font-display text-3xl font-bold text-primary">{survivor.full_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{survivor.anonymous_id} · <StatusBadge status={survivor.status} /></p>
        </div>
        <div className="w-48 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Profile completion</span>
            <span className="font-medium">{survivor.profile_completion}%</span>
          </div>
          <Progress value={survivor.profile_completion} />
          {readyForRecruiters ? (
            <Badge className="bg-success/15 text-success"><CheckCircle2 className="mr-1 size-3" /> Recruiter-ready</Badge>
          ) : (
            <p className="text-xs text-muted-foreground">Needs 60% completion + consent for recruiter visibility</p>
          )}
        </div>
      </div>

      <Tabs defaultValue="identity">
        <TabsList>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
          <TabsTrigger value="consents">Consents</TabsTrigger>
          <TabsTrigger value="matches">Job matches</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Anonymous ID</Label>
              <Input className="mt-2" value={survivor.anonymous_id} disabled />
            </div>
            <div>
              <Label>Pronouns</Label>
              <Input
                className="mt-2"
                {...form.register("pronouns")}
                onBlur={() => onBlurSave(["pronouns"])}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="background" className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label>Bio (markdown, max 2000 chars)</Label>
            <Textarea
              className="mt-2"
              rows={6}
              {...form.register("bio")}
              onBlur={() => onBlurSave(["bio"])}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Country (region only, no street address)</Label>
              <Input
                className="mt-2"
                {...form.register("location_country")}
                onBlur={() => onBlurSave(["location_country"])}
              />
            </div>
            <div>
              <Label>Region / State</Label>
              <Input
                className="mt-2"
                {...form.register("location_region")}
                onBlur={() => onBlurSave(["location_region"])}
              />
            </div>
          </div>
          <div>
            <Label>Languages (ISO codes, comma separated)</Label>
            <Input
              className="mt-2"
              {...form.register("languages")}
              onBlur={() => onBlurSave(["languages"])}
              placeholder="en, hi, bn"
            />
          </div>
        </TabsContent>

        <TabsContent value="skills" className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div>
            <Label>Skills (comma separated)</Label>
            <Input
              className="mt-2"
              {...form.register("skills")}
              onBlur={() => onBlurSave(["skills"])}
            />
          </div>
          <div>
            <Label>Availability</Label>
            <select
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("availability")}
              onBlur={() => onBlurSave(["availability"])}
            >
              <option value="">Select…</option>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4 space-y-4">
          <DocumentUploader survivorId={id} onUploaded={() => qc.invalidateQueries({ queryKey: ["survivor", id] })} />
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {docs.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">No documents uploaded yet</p>
            ) : (
              docs.map((doc: { id: string; file_name: string; doc_type: string; size_bytes: number | null }) => (
                <DocumentRow key={doc.id} doc={doc} onDelete={() => qc.invalidateQueries({ queryKey: ["survivor", id] })} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="consents" className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6">
          <ConsentToggle
            label="Share anonymized profile with recruiters"
            description="Required before recruiters can discover this survivor. Only anonymous data is shared."
            checked={form.watch("consent_share_with_recruiters")}
            changedAt={survivor.consent_share_changed_at}
            onChange={(v) => {
              form.setValue("consent_share_with_recruiters", v);
              save.mutate({ consent_share_with_recruiters: v });
            }}
          />
          <ConsentToggle
            label="Allow AI processing of profile data"
            description="Enables AI mentor to use profile context and job matching."
            checked={form.watch("consent_ai_processing")}
            changedAt={survivor.consent_ai_changed_at}
            onChange={(v) => {
              form.setValue("consent_ai_processing", v);
              save.mutate({ consent_ai_processing: v });
            }}
          />
        </TabsContent>

        <TabsContent value="matches" className="mt-4 space-y-3">
          {!jobMatches || jobMatches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No job matches yet. Complete the profile and enable AI consent to generate matches.
            </p>
          ) : (
            jobMatches.map((m: { id: string; score: number; breakdown: { reasons?: string[] }; jobs: { title: string; company_name: string } | null }) => (
              <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.jobs?.title}</p>
                    <p className="text-sm text-muted-foreground">{m.jobs?.company_name}</p>
                  </div>
                  <Badge variant="secondary">{Math.round(Number(m.score) * 100)}% match</Badge>
                </div>
                {m.breakdown?.reasons && (
                  <ul className="mt-2 text-xs text-muted-foreground">
                    {m.breakdown.reasons.map((r: string) => <li key={r}>• {r}</li>)}
                  </ul>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConsentToggle({
  label, description, checked, changedAt, onChange,
}: {
  label: string; description: string; checked: boolean;
  changedAt?: string | null; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {changedAt && <p className="mt-1 text-xs text-muted-foreground">Last changed: {new Date(changedAt).toLocaleString()}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function DocumentUploader({ survivorId, onUploaded }: { survivorId: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const { uploadUrl, token } = await uploadSurvivorDocument({
          data: {
            survivorId,
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            kind: "Other",
          },
        });
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type, ...(token ? { "x-upsert": "true" } : {}) },
          body: file,
        });
        toast.success(`Uploaded ${file.name}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    onUploaded();
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-accent hover:bg-accent/5">
      <Upload className="size-8 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">{uploading ? "Uploading…" : "Drop files or click to upload"}</p>
      <p className="text-xs text-muted-foreground">Max 10 MB · ID, Certificate, Reference, Medical, Other</p>
      <input type="file" className="hidden" multiple onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
    </label>
  );
}

function DocumentRow({ doc, onDelete }: { doc: { id: string; file_name: string; doc_type: string }; onDelete: () => void }) {
  const download = async () => {
    const { url } = await getSignedDocumentUrl({ data: { docId: doc.id } });
    window.open(url, "_blank");
  };
  const remove = async () => {
    await deleteSurvivorDocument({ data: { docId: doc.id } });
    toast.success("Document removed");
    onDelete();
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="flex items-center gap-3">
        <FileText className="size-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{doc.file_name}</p>
          <Badge variant="outline" className="mt-0.5 text-xs">{doc.doc_type}</Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={download}>Download</Button>
        <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="size-4 text-destructive" /></Button>
      </div>
    </div>
  );
}
