import { authClient } from "@/lib/auth-client";import { useQuery as useOriginalQuery } from "convex/react";
import type { FunctionReference } from "convex/server";

export function useQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Query["_args"],
  options?: { default?: Query["_returnType"], skip?: boolean }
): Query["_returnType"] | undefined {
  const session = authClient.useSession();

  const shouldSkip = options?.skip ?? !session.data;
  const result = useOriginalQuery(
    query,
    ...(shouldSkip ? ["skip"] : [args]),
  );

  return result ?? options?.default;
}