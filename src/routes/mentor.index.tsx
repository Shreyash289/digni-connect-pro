import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, MessageCircle } from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { listMentorThreads, createMentorThread } from "@/lib/notifications.functions";

export const Route = createFileRoute("/mentor/")({
  head: () => ({ meta: [{ title: "AI Mentor · CAREVIA" }] }),
  component: MentorIndex,
});

const MENTOR_NAV = [
  { to: "/mentor", label: "Conversations" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

function MentorIndex() {
  const navigate = useNavigate();

  const { data: threads, isLoading } = useQuery({
    queryKey: ["mentor-threads"],
    queryFn: () => listMentorThreads(),
  });

  useEffect(() => {
    if (!isLoading && threads && threads.length > 0) {
      navigate({ to: "/mentor/$threadId", params: { threadId: threads[0].id } });
    }
  }, [threads, isLoading, navigate]);

  async function newThread() {
    const thread = await createMentorThread({ data: {} });
    navigate({ to: "/mentor/$threadId", params: { threadId: thread.id } });
  }

  return (
    <PortalShell title="AI Mentor" nav={MENTOR_NAV} allow={["ngo_partner", "survivor", "admin", "super_admin"]}>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        {isLoading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <MessageCircle className="size-12 text-accent" />
            <h1 className="mt-4 font-display text-2xl font-bold text-primary">AI Career Mentor</h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Get trauma-informed career guidance, skill suggestions, and interview prep.
              This is coaching, not therapy — crisis resources are always available.
            </p>
            <Button className="mt-6 gap-2" onClick={newThread}>
              <Plus className="size-4" /> Start a conversation
            </Button>
          </>
        )}
      </div>
    </PortalShell>
  );
}
