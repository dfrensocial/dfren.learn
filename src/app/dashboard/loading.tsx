import { PageLoader } from "@/components/ui/page-loader";

// Shown while a dashboard page is being fetched, so navigating never looks frozen.
export default function DashboardLoading() {
  return <PageLoader label="Loading…" />;
}
