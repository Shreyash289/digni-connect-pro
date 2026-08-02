import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listMentorThreads, createMentorThread, getMentorMessages } from "@/lib/notifications.functions";

export const Route = createFileRoute("/mentor/$threadId")({
  head: () => ({ meta: [{ title: "AI Mentor · CAREVIA" }] }),
  component: MentorChat,
});

const MENTOR_NAV = [
  { to: "/mentor", label: "Conversations" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

function MentorChat() {
  const { threadId } = Route.useParams();
  return (
    <PortalShell title="AI Mentor" nav={MENTOR_NAV} allow={["ngo_partner", "survivor", "admin", "super_admin"]}>
      <ChatInner threadId={threadId} />
    </PortalShell>
  );
}

function ChatInner({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const { data: threads } = useQuery({
    queryKey: ["mentor-threads"],
    queryFn: () => listMentorThreads(),
  });

  const { data: loaderMessages } = useQuery({
    queryKey: ["mentor-messages", threadId],
    queryFn: () => getMentorMessages({ data: { threadId } }),
  });

  const initialMessages = (loaderMessages ?? []).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    parts: m.parts as { type: string; text?: string }[],
  }));

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  });

  const [input, setInput] = useState("");
  const safetyFlagged = threads?.find((t) => t.id === threadId)?.safety_flagged;

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  async function newThread() {
    const thread = await createMentorThread({ data: {} });
    navigate({ to: "/mentor/$threadId", params: { threadId: thread.id } });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <aside className="hidden w-56 shrink-0 flex-col gap-2 lg:flex">
        <Button variant="outline" size="sm" className="gap-2" onClick={newThread}>
          <Plus className="size-4" /> New chat
        </Button>
        <ScrollArea className="flex-1">
          {(threads ?? []).map((t) => (
            <Link
              key={t.id}
              to="/mentor/$threadId"
              params={{ threadId: t.id }}
              className={`block rounded-lg px-3 py-2 text-sm hover:bg-muted [&.active]:bg-accent/10 ${t.id === threadId ? "active bg-accent/10 font-medium" : "text-muted-foreground"}`}
            >
              {t.title}
            </Link>
          ))}
        </ScrollArea>
      </aside>

      <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card">
        {safetyFlagged && (
          <div className="flex items-center gap-2 border-b border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              If you or someone you know is in crisis, please contact iCrisis Helpline: 9152987821 or Vandrevala Foundation: 1860-2662-345.
              This mentor is not a substitute for professional mental health care.
            </span>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.parts?.map((part, i) =>
                  part.type === "text" ? (
                    <ReactMarkdown key={i} className="prose prose-sm dark:prose-invert max-w-none">
                      {part.text}
                    </ReactMarkdown>
                  ) : null,
                )}
              </div>
            ))}
            {(status === "submitted" || status === "streaming") && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-accent" /> CAREVIA AI is typing...
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
                Unable to reach AI. Please try again.
              </div>
            )}
          </div>
        </ScrollArea>

        <form
          className="flex gap-2 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage({ text: input });
            setInput("");
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about careers, skills, interviews…"
            disabled={status === "submitted"}
          />
          <Button type="submit" disabled={status === "submitted" || !input.trim()}>Send</Button>
        </form>

        <p className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
          AI mentor provides career coaching only, not clinical advice.{" "}
          <a href="https://www.vandrevalafoundation.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">
            Crisis resources
          </a>
        </p>
      </div>
    </div>
  );
}
