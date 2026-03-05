import { getMailRelayClient } from "@/lib/mailrelay";
import { getSubscribers, postSubscribers, postSubscribersSync } from "@/lib/mailrelay-openapi";

function parseRequiredGroupId(value: string | undefined, key: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} is missing or invalid.`);
  }
  return parsed;
}

function parseOptionalGroupId(value: string | undefined): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export function getMailrelayGroupIds(marketingOptIn: boolean): number[] {
  const supGroupId = parseRequiredGroupId(
    process.env.MAILRELAY_SUP_GROUP_ID,
    "MAILRELAY_SUP_GROUP_ID",
  );
  const marketingGroupId = parseOptionalGroupId(
    process.env.MAILRELAY_MARKETING_GROUP_ID,
  );

  if (marketingOptIn && marketingGroupId !== null) {
    return [supGroupId, marketingGroupId];
  }

  return [supGroupId];
}

export async function syncMailrelaySubscriber({
  email,
  name,
  marketingOptIn,
}: {
  email: string;
  name?: string;
  marketingOptIn: boolean;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const groupIds = getMailrelayGroupIds(marketingOptIn);
  const client = getMailRelayClient();

  await postSubscribersSync({
    client,
    body: {
      email: normalizedEmail,
      status: "active",
      group_ids: groupIds,
      replace_groups: true,
      restore_if_deleted: true,
      ...(name ? { name } : {}),
    },
  });
  // console.log("result", result.error, result.data);
  // const existing = await getSubscribers({
  //   query: {
  //     "q[email_eq]": normalizedEmail,
  //   }
  // })
  // if (!existing.data?.length) {
  //   await postSubscribers({
  //     body: {
  //       email: normalizedEmail,
  //       status: "active",
  //       group_ids: groupIds,
  //       ...(name ? { name } : {}),
  //     }
  //   });
  // } else {
  // }
}
