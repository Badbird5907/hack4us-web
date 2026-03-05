import { RUBRIC, type ApplicationType, type RubricField } from "./rubric";

export function getRankingFields(rubric: RubricField[]): RubricField[] {
  return rubric.filter((f) => f.type === "score" && f.affectsRanking);
}

export function getRubricForType(type: ApplicationType): RubricField[] {
  return RUBRIC.filter(
    (f) => !f.applicationTypes || f.applicationTypes.includes(type),
  );
}

export function computeWeightedTotal(
  scores: Record<string, number>,
  rubric: RubricField[],
): number {
  const fields = getRankingFields(rubric);
  let total = 0;
  for (const field of fields) {
    const score = scores[field.id];
    if (score === undefined) continue;
    total += score * (field.weight ?? 1);
  }
  return total;
}

export function validateScores(
  scores: Record<string, number>,
  rubric: RubricField[],
): string | null {
  const rankingFields = getRankingFields(rubric);

  for (const field of rankingFields) {
    const score = scores[field.id];
    if (score === undefined) {
      return `Missing score for "${field.label}"`;
    }
    if (!field.scale) continue;
    if (score < field.scale.min || score > field.scale.max) {
      return `Score for "${field.label}" must be between ${field.scale.min} and ${field.scale.max}`;
    }
    if (field.scale.step && (score - field.scale.min) % field.scale.step !== 0) {
      return `Score for "${field.label}" must be in increments of ${field.scale.step}`;
    }
  }

  return null;
}
