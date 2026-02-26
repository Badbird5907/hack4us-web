import { createAuth } from "../auth";

// @ts-expect-error - its fine prolly
export const auth = createAuth({});
