"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field-label";
import { TagInput } from "./tag-input";
import type { StepLinksProps } from "./types";

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
      </div>
      <div>
        <FieldLabel>LinkedIn</FieldLabel>
        <Input
          value={links.linkedin}
          onChange={(e) => updateField("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/username"
        />
      </div>
      <div>
        <FieldLabel>Twitter / X</FieldLabel>
        <Input
          value={links.twitter}
          onChange={(e) => updateField("twitter", e.target.value)}
          placeholder="https://x.com/username"
        />
      </div>
      <div>
        <FieldLabel>Instagram</FieldLabel>
        <Input
          value={links.instagram}
          onChange={(e) => updateField("instagram", e.target.value)}
          placeholder="https://instagram.com/username"
        />
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
      </div>
    </div>
  );
}
