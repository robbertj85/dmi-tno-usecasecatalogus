import { CloudRain, HeartPulse, Leaf, Recycle, Route, ShieldCheck, Zap } from "lucide-react";
import type { Domain } from "@/data/types";

const icons: Record<Domain, React.ComponentType<{ className?: string }>> = {
  mobiliteit: Route,
  energie: Zap,
  klimaatadaptatie: CloudRain,
  gezondheid: HeartPulse,
  circulariteit: Recycle,
  veiligheid: ShieldCheck,
  milieu_natuur_ecologie: Leaf,
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
