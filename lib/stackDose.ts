import { getSupplement } from "@/data/supplements";
import type { DoseUnit, StackItem, Supplement } from "@/lib/types";

export function defaultDose(supp: Supplement): { amount: number; unit: DoseUnit } {
  return { amount: supp.servingAmount, unit: supp.servingUnit };
}

export function normalizeStackItem(
  item: Partial<StackItem> & { supplementId: string },
  extras: Supplement[] = []
): StackItem {
  const supp =
    extras.find((s) => s.id === item.supplementId) ??
    getSupplement(item.supplementId);
  const fallback = supp
    ? defaultDose(supp)
    : { amount: 0, unit: "mg" as DoseUnit };
  return {
    supplementId: item.supplementId,
    timing: item.timing ?? supp?.typicalTiming ?? "anytime",
    note: item.note,
    addedAt: item.addedAt ?? new Date().toISOString(),
    amount:
      typeof item.amount === "number" && !Number.isNaN(item.amount)
        ? item.amount
        : fallback.amount,
    unit: item.unit ?? fallback.unit,
  };
}

export function unitOptions(supp: Supplement): DoseUnit[] {
  const units: DoseUnit[] = [supp.servingUnit];
  if (supp.servingUnit === "IU" && !units.includes("mcg")) units.push("mcg");
  if (supp.servingUnit === "mcg" && supp.id === "vitamin-d") units.push("IU");
  if (supp.servingUnit === "mg" && !units.includes("g")) units.push("g");
  if (supp.servingUnit === "g" && !units.includes("mg")) units.push("mg");
  return units;
}
