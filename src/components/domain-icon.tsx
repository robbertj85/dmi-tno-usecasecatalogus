import { CloudRain, HeartPulse, Route, Zap } from "lucide-react";
import type { Domain } from "@/data/types";

const icons: Record<Domain, React.ComponentType<{ className?: string }>> = {
  mobiliteit: Route,
  energie: Zap,
  klimaatadaptatie: CloudRain,
  gezondheid: HeartPulse,
};

export function DomainIcon({
  domain,
  className = "h-3.5 w-3.5",
}: {
  domain: Domain;
  className?: string;
}) {
  const Icon = icons[domain];
  return <Icon className={className} />;
}
