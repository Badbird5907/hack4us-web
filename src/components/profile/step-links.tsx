"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";
import { TagInput } from "./tag-input";
import type { StepLinksProps } from "./types";

function parseUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
}

function isDomain(url: URL, domains: string[]) {
  const hostname = url.hostname.toLowerCase();
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function validate(value: string, label: string, allowedDomains: string[]) {
  if (!value.trim()) return null;
  const url = parseUrl(value);
  if (!url) return `${label} must be a valid URL (including http:// or https://).`;
  if (!isDomain(url, allowedDomains)) {
    return `${label} must use ${allowedDomains.join(" or ")}.`;
  }
  return null;
}

function validateExternalUrl(value: string) {
  if (!value.trim()) return "Link cannot be empty.";
  const url = parseUrl(value);
  if (!url) return "Each link must be a valid URL with a real domain.";
  return null;
}

export function StepLinks({
  links,
  onChange,
}: StepLinksProps) {
  const updateField = useCallback(
    (field: keyof Omit<typeof links, "external">, value: string) => {
      onChange({ ...links, [field]: value });
    },
    [links, onChange]
  );

  const updateExternalLinks = useCallback(
    (external: string[]) => {
      onChange({ ...links, external });
    },
    [links, onChange]
  );

  const {
    githubError,
    linkedinError,
    twitterError,
    instagramError,
    invalidExternalCount,
  } = useMemo(() => {
    const githubError = validate(links.github, "GitHub link", ["github.com"]);
    const linkedinError = validate(links.linkedin, "LinkedIn link", ["linkedin.com"]);
    const twitterError = validate(links.twitter, "Twitter / X link", ["x.com", "twitter.com"]);
    const instagramError = validate(links.instagram, "Instagram link", ["instagram.com"]);
    const invalidExternalCount = links.external.filter((link) => !!validateExternalUrl(link)).length;

    return {
      githubError,
      linkedinError,
      twitterError,
      instagramError,
      invalidExternalCount,
    };
  }, [links.external, links.github, links.instagram, links.linkedin, links.twitter]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>GitHub</FieldLabel>
        <Input
          value={links.github}
          onChange={(e) => updateField("github", e.target.value)}
          placeholder="https://github.com/username"
          autoFocus
        />
        {githubError && (
          <p className="mt-1.5 text-xs text-destructive">{githubError}</p>
        )}
      </div>
      <div>
        <FieldLabel>LinkedIn</FieldLabel>
        <Input
          value={links.linkedin}
          onChange={(e) => updateField("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/username"
        />
        {linkedinError && (
          <p className="mt-1.5 text-xs text-destructive">{linkedinError}</p>
        )}
      </div>
      <div>
        <FieldLabel>Twitter / X</FieldLabel>
        <Input
          value={links.twitter}
          onChange={(e) => updateField("twitter", e.target.value)}
          placeholder="https://x.com/username"
        />
        {twitterError && (
          <p className="mt-1.5 text-xs text-destructive">{twitterError}</p>
        )}
      </div>
      <div>
        <FieldLabel>Instagram</FieldLabel>
        <Input
          value={links.instagram}
          onChange={(e) => updateField("instagram", e.target.value)}
          placeholder="https://instagram.com/username"
        />
        {instagramError && (
          <p className="mt-1.5 text-xs text-destructive">{instagramError}</p>
        )}
      </div>
      <div>
        <FieldLabel>Other Links</FieldLabel>
        <p className="mb-2 text-xs text-muted-foreground">
          Press Enter to add a link.
        </p>
        <TagInput
          value={links.external}
          onChange={updateExternalLinks}
          placeholder="https://your-portfolio.com"
        />
        {invalidExternalCount > 0 && (
          <p className="mt-1.5 text-xs text-destructive">
            {invalidExternalCount} other link{invalidExternalCount > 1 ? "s are" : " is"} invalid. Use full
            http(s) URLs with valid domains.
          </p>
        )}
      </div>
    </div>
  );
}
