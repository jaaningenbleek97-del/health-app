import type { DoseUnit, RdiProfile, StackItem, Supplement } from "@/lib/types";
import { findSupplement } from "@/lib/catalog";

export interface NutrientDef {
  id: string;
  name: string;
  unit: DoseUnit;
  rdiGeneral: number;
  rdiMale?: number;
  rdiFemale?: number;
  ul?: number;
  official: boolean;
  note: string;
}

/** Adult 19–50 NIH/ODS-style RDA or AI, plus a few unofficial wellness references. */
export const nutrients: NutrientDef[] = [
  { id: "vitamin-a", name: "Vitamin A", unit: "mcg", rdiGeneral: 800, rdiMale: 900, rdiFemale: 700, ul: 3000, official: true, note: "mcg RAE" },
  { id: "vitamin-c", name: "Vitamin C", unit: "mg", rdiGeneral: 82, rdiMale: 90, rdiFemale: 75, ul: 2000, official: true, note: "ascorbic acid" },
  { id: "vitamin-d", name: "Vitamin D", unit: "mcg", rdiGeneral: 15, rdiMale: 15, rdiFemale: 15, ul: 100, official: true, note: "15 mcg = 600 IU. Many clinicians use labs, not RDI alone." },
  { id: "vitamin-e", name: "Vitamin E", unit: "mg", rdiGeneral: 15, ul: 1000, official: true, note: "alpha-tocopherol" },
  { id: "vitamin-k", name: "Vitamin K", unit: "mcg", rdiGeneral: 105, rdiMale: 120, rdiFemale: 90, official: true, note: "AI, not RDA" },
  { id: "thiamin", name: "Thiamin (B1)", unit: "mg", rdiGeneral: 1.15, rdiMale: 1.2, rdiFemale: 1.1, official: true, note: "" },
  { id: "riboflavin", name: "Riboflavin (B2)", unit: "mg", rdiGeneral: 1.2, rdiMale: 1.3, rdiFemale: 1.1, official: true, note: "" },
  { id: "niacin", name: "Niacin (B3)", unit: "mg", rdiGeneral: 15, rdiMale: 16, rdiFemale: 14, ul: 35, official: true, note: "UL is for nicotinic acid supplements" },
  { id: "pantothenic", name: "Pantothenic acid (B5)", unit: "mg", rdiGeneral: 5, official: true, note: "AI" },
  { id: "vitamin-b6", name: "Vitamin B6", unit: "mg", rdiGeneral: 1.3, ul: 100, official: true, note: "" },
  { id: "biotin", name: "Biotin (B7)", unit: "mcg", rdiGeneral: 30, official: true, note: "AI" },
  { id: "folate", name: "Folate", unit: "mcg", rdiGeneral: 400, ul: 1000, official: true, note: "mcg DFE. UL is for folic acid from fortified food + pills." },
  { id: "vitamin-b12", name: "Vitamin B12", unit: "mcg", rdiGeneral: 2.4, official: true, note: "Absorption varies widely." },
  { id: "choline", name: "Choline", unit: "mg", rdiGeneral: 488, rdiMale: 550, rdiFemale: 425, ul: 3500, official: true, note: "AI" },
  { id: "calcium", name: "Calcium", unit: "mg", rdiGeneral: 1000, ul: 2500, official: true, note: "" },
  { id: "copper", name: "Copper", unit: "mcg", rdiGeneral: 900, ul: 10000, official: true, note: "" },
  { id: "iodine", name: "Iodine", unit: "mcg", rdiGeneral: 150, ul: 1100, official: true, note: "" },
  { id: "iron", name: "Iron", unit: "mg", rdiGeneral: 13, rdiMale: 8, rdiFemale: 18, ul: 45, official: true, note: "Needs differ a lot by sex and life stage." },
  { id: "magnesium", name: "Magnesium", unit: "mg", rdiGeneral: 360, rdiMale: 420, rdiFemale: 320, ul: 350, official: true, note: "RDI is total diet. UL 350 mg is for supplemental magnesium only." },
  { id: "manganese", name: "Manganese", unit: "mg", rdiGeneral: 2.05, rdiMale: 2.3, rdiFemale: 1.8, ul: 11, official: true, note: "AI" },
  { id: "potassium", name: "Potassium", unit: "mg", rdiGeneral: 3000, rdiMale: 3400, rdiFemale: 2600, official: true, note: "AI. Prefer food, not pills." },
  { id: "selenium", name: "Selenium", unit: "mcg", rdiGeneral: 55, ul: 400, official: true, note: "" },
  { id: "zinc", name: "Zinc", unit: "mg", rdiGeneral: 9.5, rdiMale: 11, rdiFemale: 8, ul: 40, official: true, note: "" },
  { id: "chromium", name: "Chromium", unit: "mcg", rdiGeneral: 30, rdiMale: 35, rdiFemale: 25, official: true, note: "AI" },
  { id: "sodium", name: "Sodium", unit: "mg", rdiGeneral: 1500, official: true, note: "AI. Extra only if you sweat a lot and a clinician agrees." },
  { id: "epa-dha", name: "EPA + DHA", unit: "mg", rdiGeneral: 250, official: false, note: "No US RDA. 250 mg is a common adult food-based reference." },
  { id: "creatine", name: "Creatine", unit: "g", rdiGeneral: 3, official: false, note: "No RDI. 3–5 g/day is a common studied maintenance amount." },
];

export function getNutrient(id: string): NutrientDef | undefined {
  return nutrients.find((n) => n.id === id);
}

export function rdiFor(n: NutrientDef, profile: RdiProfile): number {
  if (profile === "male" && n.rdiMale != null) return n.rdiMale;
  if (profile === "female" && n.rdiFemale != null) return n.rdiFemale;
  return n.rdiGeneral;
}

export function formatAmount(amount: number, unit: DoseUnit): string {
  const rounded =
    amount >= 100 ? Math.round(amount) : Math.round(amount * 10) / 10;
  const label = unit === "billion-CFU" ? "B CFU" : unit;
  return `${rounded} ${label}`;
}

export function vitaminDIuToMcg(iu: number): number {
  return iu / 40;
}

/** Convert a user dose unit into a nutrient’s canonical unit when possible. */
export function convertToNutrientUnit(
  amount: number,
  from: DoseUnit,
  nutrient: NutrientDef
): number | null {
  if (from === nutrient.unit) return amount;
  if (nutrient.id === "vitamin-d") {
    if (from === "IU" && nutrient.unit === "mcg") return amount / 40;
    if (from === "mcg" && nutrient.unit === "IU") return amount * 40;
  }
  if (from === "mg" && nutrient.unit === "mcg") return amount * 1000;
  if (from === "mcg" && nutrient.unit === "mg") return amount / 1000;
  if (from === "g" && nutrient.unit === "mg") return amount * 1000;
  if (from === "mg" && nutrient.unit === "g") return amount / 1000;
  return null;
}

export interface NutrientIntake {
  nutrient: NutrientDef;
  amount: number;
  rdi: number;
  pct: number;
  overUl: boolean;
  sources: { supplementId: string; name: string; amount: number }[];
}

export function stackNutrientTotals(
  stack: StackItem[],
  profile: RdiProfile,
  extras: Supplement[] = []
): NutrientIntake[] {
  const map = new Map<
    string,
    { amount: number; sources: NutrientIntake["sources"] }
  >();

  for (const item of stack) {
    const supp = findSupplement(item.supplementId, extras);
    if (!supp || !item.amount) continue;
    const scale =
      supp.servingAmount > 0 ? item.amount / supp.servingAmount : 0;
    if (!scale || item.unit !== supp.servingUnit) {
      // If the user unit matches serving unit, scale. If not, try convert
      // each nutrient independently below.
    }

    for (const contrib of supp.nutrients) {
      const nutrient = getNutrient(contrib.nutrientId);
      if (!nutrient) continue;

      let contribAmount = contrib.amount;
      if (item.unit === supp.servingUnit && supp.servingAmount > 0) {
        contribAmount = contrib.amount * (item.amount / supp.servingAmount);
      } else {
        const convertedUser = convertToNutrientUnit(
          item.amount,
          item.unit,
          nutrient
        );
        const convertedServing = convertToNutrientUnit(
          supp.servingAmount,
          supp.servingUnit,
          nutrient
        );
        if (convertedUser != null && convertedServing && convertedServing > 0) {
          contribAmount = contrib.amount * (convertedUser / convertedServing);
        } else if (supp.servingAmount > 0) {
          contribAmount = contrib.amount * (item.amount / supp.servingAmount);
        }
      }

      const cur = map.get(nutrient.id) ?? { amount: 0, sources: [] };
      cur.amount += contribAmount;
      cur.sources.push({
        supplementId: supp.id,
        name: supp.name,
        amount: contribAmount,
      });
      map.set(nutrient.id, cur);
    }
  }

  return [...map.entries()]
    .map(([id, v]) => {
      const nutrient = getNutrient(id)!;
      const rdi = rdiFor(nutrient, profile);
      const pct = rdi > 0 ? (v.amount / rdi) * 100 : 0;
      const overUl = nutrient.ul != null && v.amount > nutrient.ul;
      return { nutrient, amount: v.amount, rdi, pct, overUl, sources: v.sources };
    })
    .sort((a, b) => b.pct - a.pct);
}
