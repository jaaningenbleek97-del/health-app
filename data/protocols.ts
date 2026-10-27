import type { ApproachPillar } from "@/lib/types";

export interface Protocol {
  id: ApproachPillar;
  title: string;
  summary: string;
  why: string;
  daily: string[];
  supplementIds: string[];
  remedyIds: string[];
  workoutIds: string[];
}

export const protocols: Protocol[] = [
  {
    id: "circadian",
    title: "Circadian & light",
    summary:
      "Get bright light early, dim light at night. This is the backbone of sleep, energy, and hormone rhythm in performance wellness.",
    why: "Huberman-style teaching emphasizes morning outdoor light and evening darkness more than any pill.",
    daily: [
      "Step outside within an hour of waking for 5–20 minutes (no sunglasses if safe).",
      "Keep caffeine to the morning if sleep is fragile.",
      "Dim screens and overhead lights in the last hour before bed.",
    ],
    supplementIds: ["vitamin-d", "magnesium", "glycine"],
    remedyIds: ["morning-sun-walk", "delay-caffeine", "evening-dark"],
    workoutIds: ["morning-walk", "zone2-walk"],
  },
  {
    id: "sleep",
    title: "Sleep architecture",
    summary:
      "Protect a consistent sleep window. Magnesium-rich food, darkness, and a downshift beat late stimulants.",
    why: "Sleep is when repair, glucose control, and next-day focus are set. Functional clinics treat it as a vital sign.",
    daily: [
      "Same wake time most days, including weekends when you can.",
      "Stop caffeine 8–10 hours before bed if you wake at 3 a.m.",
      "Cool, dark, quiet room. Phone outside the bedroom if possible.",
    ],
    supplementIds: [
      "magnesium",
      "glycine",
      "theanine",
      "apigenin",
      "chamomile",
      "reishi",
      "lemon-balm",
      "melatonin",
    ],
    remedyIds: [
      "chamomile-wind-down",
      "legs-up-wall",
      "nsdr-rest",
      "ten-three-two-one",
      "epsom-salt-bath",
    ],
    workoutIds: ["evening-stretch", "yoga-restore", "nsdr-10"],
  },
  {
    id: "metabolic",
    title: "Metabolic & blood sugar",
    summary:
      "Protein, fiber, walking after meals, and fewer liquid sugars. Hyman-style food-as-foundation, not a crash diet.",
    why: "Stable energy and mood often track meal composition and movement more than exotic supplements.",
    daily: [
      "Protein at breakfast (eggs, yogurt, tofu, leftover dinner).",
      "10-minute easy walk after the biggest meal.",
      "Pair carbs with protein, fiber, or fat.",
    ],
    supplementIds: [
      "omega-3",
      "magnesium",
      "berberine",
      "psyllium",
      "chromium",
      "inositol",
      "ala",
      "cinnamon-ceylon",
    ],
    remedyIds: [
      "protein-snack",
      "post-meal-walk",
      "fiber-bowl",
      "liver-love-plate",
      "chew-slow-meal",
    ],
    workoutIds: ["zone2-walk", "power-walk", "lunch-break-move"],
  },
  {
    id: "gut",
    title: "Gut terrain",
    summary:
      "Chew well, add plants and fermented foods, and go slow with fiber. Gut comfort is a core functional-medicine lever.",
    why: "Bloating and energy crashes are often meal-timing and food-quality issues before they are a pill problem.",
    daily: [
      "Eat sitting down. Put the fork down between bites.",
      "One fermented food if you tolerate it (yogurt, kefir, sauerkraut).",
      "Increase fiber over weeks, with water.",
    ],
    supplementIds: [
      "probiotics",
      "psyllium",
      "ginger",
      "peppermint",
      "zinc",
      "l-glutamine",
      "digestive-enzymes",
      "saccharomyces-boulardii",
      "prebiotic-inulin",
      "turkey-tail",
    ],
    remedyIds: [
      "fiber-bowl",
      "ginger-tea-queasy",
      "peppermint-after-meal",
      "fermented-fork",
      "digestive-bitters-ritual",
      "bone-broth-cup",
      "castor-oil-pack",
    ],
    workoutIds: ["desk-mobility"],
  },
  {
    id: "stress",
    title: "Nervous system",
    summary:
      "Breath, nature, and down-regulation. Adaptogens are optional; the daily practice is the protocol.",
    why: "Chronic fight-or-flight raises cravings, wrecks sleep, and makes stacks feel useless.",
    daily: [
      "2–5 minutes of slow nasal breathing once a day.",
      "A short outdoor sit or walk without a podcast if you can.",
      "Protect one no-meeting block for a real meal.",
    ],
    supplementIds: [
      "ashwagandha",
      "theanine",
      "rhodiola",
      "magnesium",
      "glycine",
      "reishi",
      "holy-basil",
      "lemon-balm",
    ],
    remedyIds: [
      "box-breathing",
      "nature-sit-spot",
      "nsdr-rest",
      "cold-finish",
      "traditional-sauna",
      "forest-bath",
      "four-seven-eight-breath",
    ],
    workoutIds: ["physio-sigh", "nsdr-10", "box-breath-set", "yoga-restore"],
  },
  {
    id: "inflammation",
    title: "Inflammation & recovery",
    summary:
      "Sleep, oily fish or algae oil, colorful plants, and not training through illness. Turmeric is a spice first.",
    why: "Hyman-style work talks about food quality and recovery long before high-dose extracts.",
    daily: [
      "Fatty fish or algae omega-3 a few times a week.",
      "Half your plate plants when you can.",
      "One full rest or easy day after hard training.",
    ],
    supplementIds: [
      "omega-3",
      "turmeric",
      "vitamin-d",
      "vitamin-c",
      "ginger",
      "quercetin",
      "boswellia",
      "reishi",
      "milk-thistle",
    ],
    remedyIds: [
      "turmeric-golden-milk",
      "morning-sun-walk",
      "traditional-sauna",
      "epsom-salt-bath",
    ],
    workoutIds: ["yoga-restore", "full-body-flow"],
  },
  {
    id: "methylation",
    title: "Methylation & B vitamins",
    summary:
      "Brecka-style conversations often start with B12, folate, and B6 — plus labs, not guessing. Food first.",
    why: "These vitamins help blood cells and nerves. High-dose methyl donors are not automatically better.",
    daily: [
      "Leafy greens and legumes most days.",
      "If you eat no animal foods, plan a reliable B12 source.",
      "Don’t start high-dose B6 for months without a reason.",
    ],
    supplementIds: [
      "vitamin-b12",
      "folate",
      "vitamin-b6",
      "b-complex",
      "choline",
      "tmg-betaine",
      "desiccated-liver",
    ],
    remedyIds: ["protein-snack", "fiber-bowl"],
    workoutIds: ["morning-walk"],
  },
  {
    id: "recovery",
    title: "Strength & recovery",
    summary:
      "Creatine, protein, zone-2, and sleep. Simple, heavily studied, still underused.",
    why: "Performance podcasts circle back to creatine, walking, and lifting because the evidence is boring and strong.",
    daily: [
      "A creatine habit only if your clinician is fine with it.",
      "Easy conversational cardio most days.",
      "One short strength session 2–3× a week.",
    ],
    supplementIds: [
      "creatine",
      "omega-3",
      "magnesium",
      "vitamin-d",
      "collagen-peptides",
      "taurine",
      "protein-powder",
      "cordyceps",
      "msm",
    ],
    remedyIds: [
      "hydration-habit",
      "morning-sun-walk",
      "traditional-sauna",
      "infrared-sauna",
      "contrast-sauna",
      "sauna-hydrate",
    ],
    workoutIds: ["beginner-strength", "zone2-walk", "glute-focus"],
  },
  {
    id: "focus",
    title: "Focus & alertness",
    summary:
      "Light, sleep, delayed caffeine, and a walk beat stacked nootropics for most people.",
    why: "Huberman-style toolkits put behavior first; theanine or green tea is optional polish.",
    daily: [
      "Morning light before more caffeine if you crash at noon.",
      "Work in 50–90 minute blocks, then stand up.",
      "Keep nicotine and mega-caffeine out of the evening.",
    ],
    supplementIds: [
      "theanine",
      "green-tea",
      "tyrosine",
      "omega-3",
      "creatine",
      "lions-mane",
      "cordyceps",
      "bacopa",
    ],
    remedyIds: ["delay-caffeine", "green-tea-focus", "box-breathing", "nasal-walk"],
    workoutIds: ["desk-mobility", "lunch-break-move"],
  },
  {
    id: "minerals",
    title: "Mineral foundation",
    summary:
      "Magnesium, zinc, iodine, selenium, and electrolytes from food. Sweat, soil, and ultra-processed diets leave gaps.",
    why: "Functional panels often chase minerals because they sit under thyroid, sleep, and training.",
    daily: [
      "A handful of seeds or nuts most days.",
      "Iodized salt or seaweed if you don’t eat dairy/seafood — don’t mega-dose iodine.",
      "Replace sweat with food + water, not candy-colored drinks.",
    ],
    supplementIds: [
      "magnesium",
      "zinc",
      "selenium",
      "iodine",
      "electolyte-minerals",
      "manganese",
      "boron",
      "shilajit",
    ],
    remedyIds: ["hydration-habit", "magnesium-walk", "sauna-hydrate"],
    workoutIds: ["zone2-walk", "power-walk"],
  },
];

export const pillarLabels: Record<ApproachPillar, string> = {
  circadian: "Circadian",
  sleep: "Sleep",
  metabolic: "Metabolic",
  gut: "Gut",
  stress: "Stress",
  inflammation: "Inflammation",
  methylation: "Methylation",
  recovery: "Recovery",
  focus: "Focus",
  minerals: "Minerals",
};
