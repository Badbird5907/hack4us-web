import { Workpool, type WorkpoolComponent } from "@convex-dev/workpool";
import { components } from "./_generated/api";

const emailWorkpoolComponent = (
  components as unknown as { emailWorkpool: WorkpoolComponent }
).emailWorkpool;

export const emailWorkpool = new Workpool(emailWorkpoolComponent, {
  maxParallelism: 5,
  retryActionsByDefault: false,
});
