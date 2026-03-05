import { defineApp } from "convex/server";
import workpool from "@convex-dev/workpool/convex.config";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(workpool, { name: "emailWorkpool" });
app.use(betterAuth);

export default app;
