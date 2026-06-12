import { useQuery } from "@tanstack/react-query";

import { fetchDashboardIndicators } from "./api";

export function useDashboardIndicators() {
  return useQuery({
    queryKey: ["dashboard", "indicators"],
    queryFn: fetchDashboardIndicators,
  });
}
