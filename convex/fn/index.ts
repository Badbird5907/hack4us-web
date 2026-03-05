import { customCtx, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { query as rawQuery, mutation as rawMutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";
import { authComponent, createAuth } from "../auth";
import type { Permissions } from "@/lib/permissions";

export const query = customQuery(
  rawQuery,
  customCtx(async (ctx: GenericQueryCtx<DataModel>) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user, userId: user.subject };
  })
)

export const mutation = customMutation(
  rawMutation,
  customCtx(async (ctx: GenericMutationCtx<DataModel>) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { user, userId: user.subject };
  })
)

async function checkPermission(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
  userId: string,
  permissions: Permissions,
) {
  const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
  const result = await auth.api.userHasPermission({
    body: {
      userId,
      permissions: permissions as Record<string, string[]>,
    },
    headers,
  });
  if (!result.success) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Insufficient permissions" });
  }
}

export function queryWithPermission(permissions: Permissions) {
  return customQuery(
    rawQuery,
    customCtx(async (ctx: GenericQueryCtx<DataModel>) => {
      const user = await ctx.auth.getUserIdentity();
      if (!user) throw new Error("Unauthorized");
      await checkPermission(ctx, user.subject, permissions);
      return { user, userId: user.subject };
    }),
  );
}

export function mutationWithPermission(permissions: Permissions) {
  return customMutation(
    rawMutation,
    customCtx(async (ctx: GenericMutationCtx<DataModel>) => {
      const user = await ctx.auth.getUserIdentity();
      if (!user) throw new Error("Unauthorized");
      await checkPermission(ctx, user.subject, permissions);
      return { user, userId: user.subject };
    }),
  );
}

