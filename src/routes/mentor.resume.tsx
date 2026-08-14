import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, FileText, Upload, Trash2, Eye } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getOrCreateSurvivorProfile,
  getSignedResumeUrl,
  updateResumeMetadata,
} from "@/lib/survivors.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/mentor/resume")({
  head: () => ({ meta: [{ title: "My Resume · CAREVIA" }] }),
  component: ResumeManagementPage,
});

const MENTOR_NAV = [
  { to: "/mentor", label: "Conversations" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

function ResumeManagementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get or create survivor profile for the logged in user
  const { data: survivor, isLoading, error } = useQuery({
    queryKey: ["my-survivor-profile"],
    queryFn: () => getOrCreateSurvivorProfile(),
  });

  const updateMetadataMutation = useMutation({
    mutationFn: (vars: { resumeUrl: string | null; resumeName: string | null }) =>
      updateResumeMetadata({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-survivor-profile"] });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds the 10 MB limit.");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const storagePath = `${user.id}/resume.pdf`;

      // Upload to storage bucket (upsert = true allows replacement)
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, file, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      // The "resumes" bucket is private — there is no working public URL to
      // store. Persist the storage path as the existence marker; viewing
      // always goes through getSignedResumeUrl(), which re-derives it fresh.
      await updateMetadataMutation.mutateAsync({
        resumeUrl: storagePath,
        resumeName: file.name,
      });

      toast.success("Resume Uploaded Successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload resume.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleViewResume = async () => {
    try {
      const { url } = await getSignedResumeUrl();
      window.open(url, "_blank");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load resume view link.");
    }
  };

  const handleDeleteResume = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const storagePath = `${user.id}/resume.pdf`;

      // Remove from Supabase Storage
      const { error: storageErr } = await supabase.storage
        .from("resumes")
        .remove([storagePath]);

      if (storageErr) throw storageErr;

      // Clear metadata in DB
      await updateMetadataMutation.mutateAsync({
        resumeUrl: null,
        resumeName: null,
      });

      toast.success("Resume Deleted Successfully");
      setDeleteModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete resume.");
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <PortalShell title="AI Mentor" nav={MENTOR_NAV} allow={["survivor", "ngo_partner", "admin", "super_admin"]}>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
          <p>Failed to load profile. Please try refreshing.</p>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="AI Mentor" nav={MENTOR_NAV} allow={["survivor", "ngo_partner", "admin", "super_admin"]}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Resume Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your professional resume. Only one resume can be permanently attached to your account.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">Resume</CardTitle>
              <CardDescription>Upload or update your PDF resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {survivor?.resume_url ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border p-4 bg-muted/20">
                    <FileText className="size-10 text-primary shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-foreground">
                        {survivor.resume_name || "resume.pdf"}
                      </p>
                      {survivor.resume_uploaded_at && (
                        <p className="text-xs text-muted-foreground">
                          Uploaded on {new Date(survivor.resume_uploaded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleViewResume}>
                      <Eye className="size-4" /> View Resume
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      Replace Resume
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      <Trash2 className="size-4" /> Delete Resume
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 text-center bg-muted/10">
                  <FileText className="size-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-foreground">No Resume Uploaded</p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-6">
                    Upload your professional resume in PDF format (maximum size 10 MB).
                  </p>
                  <Button
                    className="gap-2"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    Upload Resume
                  </Button>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Resume?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your resume from the CAREVIA repository.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteResume}
            >
              {deleting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
}
