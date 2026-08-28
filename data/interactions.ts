export type InteractionLevel = "caution" | "timing" | "info";

export interface InteractionNote {
  a: string;
  b: string;
  level: InteractionLevel;
  note: string;
}

const pairs: InteractionNote[] = [
  {
    a: "iron",
    b: "calcium",
    level: "timing",
    note: "Calcium can reduce iron absorption. Separate by a few hours if you take both as pills.",
  },
  {
    a: "iron",
    b: "magnesium",
    level: "timing",
    note: "Minerals can compete. High-dose iron is often taken away from other mineral pills.",
  },
  {
    a: "iron",
    b: "zinc",
    level: "timing",
    note: "High-dose zinc and iron can compete for absorption. Food-first, or separate if both are high dose.",
  },
  {
    a: "zinc",
    b: "copper",
    level: "caution",
    note: "Long-term high-dose zinc can lower copper. This is education — not a reason to add copper on your own.",
  },
  {
    a: "zinc",
    b: "magnesium",
    level: "timing",
    note: "Large mineral doses together can be hard on the gut. Split them if you get queasy.",
  },
  {
    a: "calcium",
    b: "magnesium",
    level: "timing",
    note: "Both are minerals. Many people take magnesium in the evening and calcium with food.",
  },
  {
    a: "vitamin-d",
    b: "vitamin-k2",
    level: "info",
    note: "Often paired in wellness stacks with a fat-containing meal. Not a medical protocol.",
  },
  {
    a: "vitamin-d",
    b: "magnesium",
    level: "info",
    note: "Magnesium is involved in vitamin D metabolism. Food plus a reasonable dose beats megadoses.",
  },
  {
    a: "iodine",
    b: "selenium",
    level: "caution",
    note: "Thyroid minerals are easy to overshoot. Do not megadose iodine. Labs beat guessing.",
  },
  {
    a: "berberine",
    b: "chromium",
    level: "caution",
    note: "Both show up in blood-sugar conversations. Combining them is not automatically better — ask a clinician if you take glucose-lowering drugs.",
  },
  {
    a: "ashwagandha",
    b: "theanine",
    level: "info",
    note: "Both are used for downshift. Full doses of several calm agents at once can make you groggy.",
  },
  {
    a: "ashwagandha",
    b: "glycine",
    level: "info",
    note: "Two evening downshift items. Start with one change and see how you sleep.",
  },
  {
    a: "theanine",
    b: "glycine",
    level: "info",
    note: "Sleep stacks add up. You do not need every amino on the same night.",
  },
  {
    a: "theanine",
    b: "apigenin",
    level: "info",
    note: "Both show up in evening wind-down stacks. More is not automatically better.",
  },
  {
    a: "theanine",
    b: "chamomile",
    level: "info",
    note: "Tea plus a theanine capsule is a common pairing, not a requirement.",
  },
  {
    a: "apigenin",
    b: "chamomile",
    level: "info",
    note: "Apigenin is a chamomile flavonoid — tea plus an extract is easy to double up.",
  },
  {
    a: "green-tea",
    b: "theanine",
    level: "info",
    note: "Green tea already has some theanine. Extra theanine is optional polish.",
  },
  {
    a: "magnesium",
    b: "glycine",
    level: "info",
    note: "Glycinate already includes glycine. Extra glycine is optional.",
  },
  {
    a: "lavender",
    b: "ashwagandha",
    level: "info",
    note: "Two calming agents. Keep them evening-only if they leave you foggy.",
  },
  {
    a: "vitamin-k2",
    b: "omega-3",
    level: "info",
    note: "Both are often taken with a meal that has fat. That is about absorption, not a protocol.",
  },
];

const SLEEP_STACK = [
  "ashwagandha",
  "theanine",
  "glycine",
  "apigenin",
  "chamomile",
  "lavender",
];

export function notesForIds(ids: string[]): InteractionNote[] {
  const set = new Set(ids);
  const found = pairs.filter((p) => set.has(p.a) && set.has(p.b));
  const sleepHits = SLEEP_STACK.filter((id) => set.has(id));
  if (sleepHits.length >= 3) {
    found.push({
      a: sleepHits[0],
      b: sleepHits[1],
      level: "info",
      note: `You have ${sleepHits.length} downshift items (herbs/aminos). Full doses of all of them on the same night can leave you groggy. Education only — not a taper plan.`,
    });
  }
  const seen = new Set<string>();
  return found.filter((n) => {
    const key = [n.a, n.b, n.note].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
