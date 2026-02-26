import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements
} as const;
export type Permissions = {
  readonly [K in keyof typeof statement]?: (typeof statement)[K][number][];
};

const ac = createAccessControl(statement);

export const user = ac.newRole({
});

export const reviewer = ac.newRole({});

export const admin = ac.newRole({
  user: [...statement.user]
});