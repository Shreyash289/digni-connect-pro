import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /survivor → redirect to /survivor/dashboard
 * This keeps the route namespace clean and future-proof.
 */
export const Route = createFileRoute("/survivor/")({
  beforeLoad: () => {
    throw redirect({ to: "/survivor/dashboard" });
  },
  component: () => null,
});
