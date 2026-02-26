export * from "./schemas";

export { attendeeConfig } from "./attendee";
export { mentorConfig } from "./mentor";
export { volunteerConfig } from "./volunteer";

export * as attendee from "./attendee";
export * as mentor from "./mentor";
export * as volunteer from "./volunteer";

import type { ApplicationConfig } from "./schemas";
import { attendeeConfig } from "./attendee";
import { mentorConfig } from "./mentor";
import { volunteerConfig } from "./volunteer";

export const applicationTypes = {
  attendee: attendeeConfig,
  mentor: mentorConfig,
  volunteer: volunteerConfig,
} as const;

export type ParticipantRole = keyof typeof applicationTypes;
