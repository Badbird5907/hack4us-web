import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  adminDashboard: ["view"],
  siteSettings: ["manage"],
  review: ["submit", "flag", "bypass"],
} as const;

export type Permissions = {
  readonly [K in keyof typeof statement]?: (typeof statement)[K][number][];
};

export const ac = createAccessControl(statement);

export const user = ac.newRole({
  review: [],
});

export const reviewer = ac.newRole({
  adminDashboard: ["view"],
  review: ["submit", "flag"],
  siteSettings: [],
});

export const admin = ac.newRole({
  user: [...statement.user],
  adminDashboard: [...statement.adminDashboard],
  siteSettings: [...statement.siteSettings],
  review: ["submit", "flag", "bypass"],
});
