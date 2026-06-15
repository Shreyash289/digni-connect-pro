import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/ngo/")({
  beforeLoad: () => {
    throw redirect({ to: "/ngo/dashboard" });
  },
});
