import type { MaterialItem } from "@/types/material";

export function canMutateMaterial(
  material: MaterialItem,
  actorId?: string,
  role?: string | null,
) {
  return (
    role === "MANAGER" ||
    (!!actorId &&
      ["CREATOR", "CLIENT"].includes(role ?? "") &&
      material.createdBy === actorId)
  );
}

export function retentionDays(material: MaterialItem, now = Date.now()) {
  if (!material.deletedAt) return 0;
  return Math.max(
    0,
    Math.ceil(
      (Date.parse(material.deletedAt) + 30 * 86_400_000 - now) / 86_400_000,
    ),
  );
}
