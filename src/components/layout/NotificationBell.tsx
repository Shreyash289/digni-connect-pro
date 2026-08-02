import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications.functions";

const KIND_LABELS: Record<string, string> = {
  ngo_approved: "NGO approved",
  ngo_rejected: "NGO rejected",
  recruiter_verified: "Recruiter verified",
  recruiter_rejected: "Recruiter rejected",
  intro_request_received: "Introduction request",
  intro_request_responded: "Introduction response",
  job_application_received: "New application",
  application_status_changed: "Application update",
  mentor_safety_flag: "Safety alert",
  weekly_digest: "Weekly digest",
};

export function NotificationBell() {
  const qc = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => getUnreadCount(),
    refetchInterval: 5000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications({ data: { limit: 15 } }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) => markNotificationRead({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-5" />
          {(unread?.count ?? 0) > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread!.count > 9 ? "9+" : unread!.count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {(unread?.count ?? 0) > 0 && (
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {!notifications || notifications.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className={`flex flex-col items-start gap-0.5 px-3 py-2 ${!n.read_at ? "bg-accent/5" : ""}`}
              onClick={() => !n.read_at && markRead.mutate(n.id)}
            >
              <span className="text-sm font-medium">{KIND_LABELS[n.kind] ?? n.kind}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings/notifications" className="w-full text-center text-sm text-accent">
            Notification settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
