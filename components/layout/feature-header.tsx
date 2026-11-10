import type { ReactNode } from "react";
import { features, type FeatureId } from "@/lib/features";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "./page-shell";

/** Page header for a product area, with its icon and live status from the registry. */
export function FeatureHeader({
  id,
  title,
  children,
}: {
  id: FeatureId;
  title: ReactNode;
  children?: ReactNode;
}) {
  const feature = features[id];
  return (
    <PageHeader
      icon={feature.icon}
      eyebrow={feature.name}
      meta={<StatusBadge status={feature.status} />}
      title={title}
      description={feature.description}
    >
      {children}
    </PageHeader>
  );
}
