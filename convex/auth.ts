import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, type ActionCtx } from "./_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth/minimal";
import { admin as adminPlugin } from "better-auth/plugins";
import { v } from "convex/values";
import { ac,admin,reviewer,user } from "@/lib/permissions";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";
import { render } from "@react-email/render";
import { VerificationEmail } from "../src/emails/verification-email";
import { syncMailrelaySubscriber } from "@/lib/mailrelay-subscriber";

const siteUrl = process.env.SITE_URL!;

function hasRunFns(
  ctx: GenericCtx<DataModel>,
): ctx is ActionCtx {
  return "runQuery" in ctx && "runMutation" in ctx;
}

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  }
);

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      sendVerificationEmail: async ({ user, url }) => {
        try {
          if (!hasRunFns(ctx)) {
            console.error("[auth] Missing action context for verification email");
            throw new Error("Unable to send verification email.");
          }

          const html = await render(
            VerificationEmail({
              userName: user.name,
              verificationUrl: url,
            })
          );

          await ctx.runMutation(internal.fn.emailActions.enqueueEmail, {
            to: user.email,
            subject: "Verify your Hack4Us account",
            html,
          });
        } catch (error) {
          console.error("[auth] Failed to send verification email", error);
          throw new Error("Unable to send verification email.");
        }
      },
      afterEmailVerification: async (user) => {
        try {
          if (!hasRunFns(ctx)) {
            console.error("[auth] Missing action context for email verification sync");
            return;
          }

          const email = user.email.trim().toLowerCase();
          const now = Date.now();

          await syncMailrelaySubscriber({
            email,
            name: user.name,
            marketingOptIn: false,
          });

          await ctx.runMutation(internal.fn.email.markEmailPreferenceSynced, {
            email,
            userId: user.id,
            mailrelaySyncedAt: now,
            marketingOptIn: false,
          });
        } catch (error) {
          console.error("[auth] Failed to sync verified user to Mailrelay", error);
        }
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
      adminPlugin({
        ac: ac,
        roles: {
          admin,
          reviewer,
          user,
        },
        defaultRole: "user",
      }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

export const hasPermission = query({
  args: {
    permissions: v.record(v.string(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: identity.subject,
        permissions: args.permissions,
      },
      headers,
    });

    return hasPermission.success;
  },
});
