import { createFileRoute } from "@tanstack/react-router";
import { OrchardGame } from "@/components/orchard-game";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <OrchardGame />;
}
