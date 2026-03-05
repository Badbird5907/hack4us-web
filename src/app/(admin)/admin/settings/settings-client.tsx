"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { NavbarSlot } from "@/components/navbar-slot";
import { useQuery } from "@/hooks/convex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function AdminSettingsClient() {
  const [isSaving, setIsSaving] = useState(false);
  const settings = useQuery(api.fn.siteSettings.getAdminSiteSettings, {});
  const setApplicationsState = useMutation(api.fn.siteSettings.setApplicationsState);

  const applicationsState = settings?.applicationsState ?? "open";

  const handleSetApplicationsState = async (state: "open" | "closed" | "ended") => {
    setIsSaving(true);
    try {
      await setApplicationsState({ state });
      if (state === "open") {
        toast.success("Applications are now open");
      } else if (state === "closed") {
        toast.success("Applications are set to open soon");
      } else {
        toast.success("Applications are now ended");
      }
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <NavbarSlot>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black tracking-widest uppercase leading-none">
            Admin
          </span>
          <span className="text-muted-foreground text-sm leading-none">&mdash;</span>
          <span className="text-sm font-semibold tracking-wide uppercase leading-none">
            Settings
          </span>
        </div>
      </NavbarSlot>

      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6">
        <h1 className="text-2xl font-black tracking-tight uppercase">Site Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Control global behavior for the website.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-black tracking-wide uppercase">
                Applications
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Open applications, mark them as opening soon, or mark them as ended.
              </p>
            </div>

            {settings === undefined ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <Badge variant={applicationsState === "open" ? "default" : "secondary"}>
                {applicationsState === "open"
                  ? "Open"
                  : applicationsState === "closed"
                    ? "Opens soon"
                    : "Ended"}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleSetApplicationsState("open")}
              disabled={isSaving || settings === undefined || applicationsState === "open"}
              className="text-xs tracking-wider uppercase"
            >
              Open applications
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleSetApplicationsState("closed")}
              disabled={isSaving || settings === undefined || applicationsState === "closed"}
              className="text-xs tracking-wider uppercase"
            >
              Applications open soon
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleSetApplicationsState("ended")}
              disabled={isSaving || settings === undefined || applicationsState === "ended"}
              className="text-xs tracking-wider uppercase"
            >
              End applications
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
