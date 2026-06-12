import { QueryClient } from "@tanstack/react-query";

import { logError } from "./log-error";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error) => {
          logError(error, { scope: "mutation" });
        },
      },
    },
  });
}
