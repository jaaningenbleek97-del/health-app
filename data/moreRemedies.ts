import type { Remedy } from "@/lib/types";

/** Heat, gut rituals, and other functional-medicine lifestyle practices. */
export const moreRemedies: Remedy[] = [
  {
    id: "traditional-sauna",
    title: "Traditional sauna session",
    category: "recovery",
    summary:
      "Dry or Finnish-style heat for 8–20 minutes. A recovery ritual in performance wellness — not a medical treatment.",
    ingredients: [
      "Sauna you can leave at any time",
      "Water bottle",
      "Towel",
      "Cool rinse option",
    ],
    steps: [
      "Hydrate before you go in. Skip alcohol.",
      "Sit at a heat you can talk in. Start with 8–12 minutes.",
      "Step out if you feel dizzy, chest tightness, or panic.",
      "Cool down, sip water, add a pinch of salt if you sweated hard.",
    ],
    howToUse:
      "2–4 sessions a week is a common wellness pattern. More is not automatically better.",
    safety:
      "Heat stress is real. Pregnancy, unstable heart disease, and fever are reasons to skip. Never sauna alone if you are new or unwell.",
    seeDoctorIf:
      "Chest pain, fainting, uncontrolled blood pressure, or you take meds that affect heat/fluid balance.",
    pillars: ["recovery", "stress", "inflammation"],
  },
  {
    id: "infrared-sauna",
    title: "Infrared sauna session",
    category: "recovery",
    summary:
      "Lower air temperature, longer sit. Still heat. Still sweat. Still not a detox cure.",
    ingredients: ["Infrared cabin or blanket", "Water", "Timer"],
    steps: [
      "Start at 15–20 minutes, not a full hour on day one.",
      "Keep a bottle in reach. You can sit more upright than in a scorching dry sauna.",
      "Stop for dizziness or nausea.",
      "Rinse, rehydrate, and eat a normal meal after.",
    ],
    howToUse:
      "Use it as a wind-down or recovery block, not as punishment or a ‘toxin flush’.",
    safety:
      "Same rules as any sauna: heart, pregnancy, alcohol, and kids need extra caution. Blankets can overheat — follow the device manual.",
    seeDoctorIf:
      "You have implants you were told to keep away from heat, or cardiovascular disease.",
    pillars: ["recovery", "sleep", "inflammation"],
  },
  {
    id: "contrast-sauna",
    title: "Sauna + cool rinse",
    category: "recovery",
    summary:
      "Heat, then a brief cool shower. A classic contrast ritual. Optional — skip ice if your heart is not cleared for it.",
    ingredients: ["Sauna", "Cool (not ice-shock) shower", "Towel"],
    steps: [
      "8–15 minutes of comfortable heat.",
      "Cool rinse 30–90 seconds. Breathe slowly.",
      "Repeat once if you feel good. Stop at one round when new.",
      "Rewarm with clothes and water after.",
    ],
    howToUse:
      "The cool step is a nervous-system contrast, not a requirement for ‘getting the benefits’.",
    safety:
      "No breath-holds in water. No ice tubs if you have heart disease. Get out if you feel faint.",
    seeDoctorIf: "Chest pain, arrhythmia history, or fainting with temperature swings.",
    pillars: ["recovery", "stress"],
  },
  {
    id: "steam-room",
    title: "Steam room sit",
    category: "recovery",
    summary:
      "Wet heat. Easier on some joints, harder if you are heat-sensitive or congested-asthma.",
    ingredients: ["Steam room", "Water", "Flip-flops if shared space"],
    steps: [
      "Sit 5–12 minutes to start.",
      "Leave if breathing feels tight.",
      "Rinse and hydrate.",
    ],
    howToUse: "A gentler heat option when dry sauna feels too sharp.",
    safety:
      "Shared steam rooms are slippery and microbial — shower after. Skip if steam triggers asthma.",
    seeDoctorIf: "Breathing difficulty or you are pregnant and unsure about heat.",
    pillars: ["recovery", "inflammation"],
  },
  {
    id: "epsom-salt-bath",
    title: "Epsom salt soak",
    category: "recovery",
    summary:
      "Warm bath with magnesium sulfate. Comfort and ritual. Skin absorption of magnesium is modest — still a useful wind-down.",
    ingredients: ["1–2 cups Epsom salt", "Warm (not scalding) bath", "20 minutes"],
    steps: [
      "Dissolve salt in running water.",
      "Soak 15–20 minutes. Keep the room dim if this is evening.",
      "Sip water. Stand up slowly.",
    ],
    howToUse: "Evening recovery or after a long training day.",
    safety:
      "Hot baths are heat stress too. Skip very hot soaks in pregnancy unless your clinician is fine with it. Broken skin can sting.",
    seeDoctorIf: "Open wounds, uncontrolled blood pressure, or you feel faint in hot water.",
    pillars: ["recovery", "sleep", "stress"],
  },
  {
    id: "castor-oil-pack",
    title: "Castor oil pack",
    category: "digestion",
    summary:
      "A classic functional-medicine comfort pack over the abdomen. External only. Evidence is mostly traditional.",
    ingredients: [
      "Cold-pressed castor oil",
      "Flannel or old cloth",
      "Wrap or towel",
      "Optional warm (not hot) water bottle",
    ],
    steps: [
      "Lie down. Oil the cloth — not your whole sofa.",
      "Place over the belly, not on broken skin.",
      "Cover and rest 20–45 minutes.",
      "Wash the oil off; it stains.",
    ],
    howToUse: "A quiet evening ritual, not a liver cleanse.",
    safety:
      "External use only. Don’t use on wounds. Pregnancy and trying-to-conceive: ask first — castor is traditionally avoided then.",
    seeDoctorIf: "Severe abdominal pain, fever, or you are pregnant.",
    pillars: ["gut"],
  },
  {
    id: "oil-pulling",
    title: "Oil pulling",
    category: "immunity",
    summary:
      "Swish a teaspoon of oil for several minutes, then spit. A mouth comfort habit — not a systemic detox.",
    ingredients: ["1 tsp coconut or sesame oil", "Sink"],
    steps: [
      "Swish 5–10 minutes (start with 2).",
      "Spit in the trash, not the drain if you can (oil clogs pipes).",
      "Rinse and brush as usual.",
    ],
    howToUse: "Optional add-on to brushing and flossing, not a replacement.",
    safety: "Don’t swallow the oil. Don’t replace fluoride toothpaste if your dentist wants it.",
    seeDoctorIf: "Jaw pain, cracked teeth, or infection — see a dentist.",
    pillars: ["inflammation"],
  },
  {
    id: "tongue-scrape",
    title: "Tongue scrape",
    category: "digestion",
    summary:
      "Ayurvedic-style morning scrape. Freshens the mouth and is a simple gut-hygiene cue.",
    ingredients: ["Metal or plastic tongue scraper", "Sink"],
    steps: [
      "Gently scrape from back to tip 3–5 times.",
      "Rinse the scraper.",
      "Drink water after.",
    ],
    howToUse: "Part of a morning ritual before coffee if you like.",
    safety: "Don’t scrape until you bleed. Easy pressure is enough.",
    seeDoctorIf: "White patches that don’t scrape off, or mouth sores that last.",
    pillars: ["gut"],
  },
  {
    id: "neti-rinse",
    title: "Saline nasal rinse",
    category: "immunity",
    summary:
      "Isotonic salt water through the nose. Comfort for stuffiness. Sterile or distilled water only.",
    ingredients: [
      "Neti pot or squeeze bottle",
      "Distilled, sterile, or boiled-then-cooled water",
      "Saline packet or ¼ tsp non-iodized salt per cup",
    ],
    steps: [
      "Use only safe water — never straight tap in the neti pot.",
      "Lean over the sink, mouth open, pour or squeeze so it exits the other nostril.",
      "Gently blow. Repeat the other side.",
      "Wash the device and let it dry.",
    ],
    howToUse: "Short-term comfort with a cold or dry air. Not a daily forever requirement.",
    safety:
      "Tap water in a neti pot has caused rare serious infections. Boil or buy distilled. Don’t force it if your ears pop painfully.",
    seeDoctorIf: "Ear pain, recurrent sinus infections, or you had recent nasal surgery.",
    pillars: ["inflammation"],
  },
  {
    id: "digestive-bitters-ritual",
    title: "Bitter taste before a meal",
    category: "digestion",
    summary:
      "Arugula, grapefruit, or a few drops of bitters. A functional gut cue to sit down and start digestion.",
    ingredients: ["Bitter green or labeled bitters", "Water", "Your meal"],
    steps: [
      "Sit. Put the phone down.",
      "Taste something bitter or take bitters in water 5–10 minutes before eating.",
      "Chew the first bites slowly.",
    ],
    howToUse: "Before the meal that usually bothers you.",
    safety: "Skip alcohol tinctures if you avoid alcohol. Bitters can worsen ulcers and reflux.",
    seeDoctorIf: "Burning pain, black stools, or you take ulcer medication.",
    pillars: ["gut"],
  },
  {
    id: "fermented-fork",
    title: "Fermented forkful",
    category: "digestion",
    summary:
      "A spoon of sauerkraut, kimchi, or kefir with a meal. Food-first probiotics.",
    ingredients: ["1–2 tbsp live sauerkraut or kimchi, or ½ cup kefir/yogurt"],
    steps: [
      "Add the ferment to a meal, not on an empty irritated stomach if you are new.",
      "Start with a teaspoon if you bloat easily.",
      "Keep the jar cold after opening.",
    ],
    howToUse: "Most days if you tolerate it. Variety beats one expensive capsule.",
    safety: "High salt in some krauts. Histamine-sensitive people may flare. Immunocompromised: ask first.",
    seeDoctorIf: "Severe IBD, immunosuppression, or you react badly to ferments.",
    pillars: ["gut"],
  },
  {
    id: "bone-broth-cup",
    title: "Bone broth cup",
    category: "digestion",
    summary:
      "A warm mug of broth between meals or with dinner. Minerals, glycine, and comfort — not a cleanse.",
    ingredients: ["Homemade or low-junk carton broth", "Mug", "Optional ginger"],
    steps: [
      "Warm gently. Taste for salt.",
      "Sip sitting down.",
      "Pair with a real meal later — broth is not lunch forever.",
    ],
    howToUse: "Gut-comfort evenings or after a long training day.",
    safety: "Store-bought broth can be a salt bomb. Histamine can bother some people.",
    seeDoctorIf: "You have a strict fluid or sodium limit.",
    pillars: ["gut", "recovery"],
  },
  {
    id: "dry-brush",
    title: "Dry brushing",
    category: "skin",
    summary:
      "Light strokes toward the heart before a shower. Circulation and skin feel — not lymphatic surgery.",
    ingredients: ["Natural-bristle brush", "Dry skin"],
    steps: [
      "Start at the feet. Long light strokes upward.",
      "Skip broken skin, varicose areas that hurt, and the face.",
      "Shower after. Moisturize.",
    ],
    howToUse: "A 2-minute morning cue if you like the ritual.",
    safety: "Don’t brush hard. Not for inflamed rashes or thin, tearing skin.",
    seeDoctorIf: "Unexplained bruises or a spreading rash.",
    pillars: ["recovery"],
  },
  {
    id: "forest-bath",
    title: "Forest bath (slow nature walk)",
    category: "stress",
    summary:
      "A slow walk among trees without a podcast. Japanese shinrin-yoku as a nervous-system practice.",
    ingredients: ["Safe green space", "20–40 minutes", "Phone on silent"],
    steps: [
      "Walk slower than your usual pace.",
      "Notice smell, light, and sound.",
      "Sit for 5 minutes if you can.",
    ],
    howToUse: "Once a week is already a win. Parks count.",
    safety: "Choose well-used paths. Sun and tick sense for your region.",
    seeDoctorIf: "Outdoor panic that doesn’t settle — use a smaller sit-spot first.",
    pillars: ["stress", "circadian"],
  },
  {
    id: "barefoot-ground",
    title: "Barefoot ground time",
    category: "circadian",
    summary:
      "A few minutes of safe grass or sand. Sensory and circadian, not an electron medical device.",
    ingredients: ["Clean grass, sand, or dirt", "2–10 minutes"],
    steps: [
      "Check for glass and sharp debris.",
      "Stand or walk slowly.",
      "Put shoes back on for the rest of the day if streets are dirty.",
    ],
    howToUse: "Pair with morning light if the ground is safe.",
    safety: "Wounds, neuropathy, and city glass are reasons to skip. Parks over parking lots.",
    seeDoctorIf: "Diabetic feet or you can’t feel the ground well.",
    pillars: ["circadian", "stress"],
  },
  {
    id: "four-seven-eight-breath",
    title: "4-7-8 breathing",
    category: "stress",
    summary: "A longer exhale pattern used to downshift. Stop if you feel odd.",
    ingredients: ["Chair", "2 minutes"],
    steps: [
      "Inhale quietly through the nose for 4.",
      "Hold for 7 if comfortable — or skip the hold.",
      "Exhale through the mouth for 8.",
      "Repeat 4 rounds.",
    ],
    howToUse: "Before bed or after a spike of stress.",
    safety: "Holds are optional. Sit down. Stop if you tingle or panic.",
    seeDoctorIf: "Chest pain or trauma flooding during breathwork.",
    pillars: ["stress", "sleep"],
  },
  {
    id: "heat-pad-comfort",
    title: "Warm pack comfort",
    category: "recovery",
    summary:
      "A wheat bag or warm pack on tight muscles or menstrual cramps. Simple heat.",
    ingredients: ["Warm pack (not scalding)", "Cloth layer"],
    steps: [
      "Test the heat on your wrist.",
      "20 minutes on, then off.",
      "Move gently after.",
    ],
    howToUse: "Desk shoulders, low-back tightness, or cycle comfort.",
    safety: "Don’t sleep on a heating pad. Don’t use on numb skin or after some pain patches.",
    seeDoctorIf: "Pain that wakes you, fever, or sudden severe abdominal pain.",
    pillars: ["recovery", "inflammation"],
  },
  {
    id: "sauna-hydrate",
    title: "After-sauna salt & water",
    category: "recovery",
    summary:
      "Replace sweat on purpose. Water plus a little sodium beats chugging liters of plain water only.",
    ingredients: ["Water", "Pinch of salt or an electrolyte packet", "A normal meal"],
    steps: [
      "Sip 300–500 ml over the next hour — not a gallon at once.",
      "Add salt if you sweated a lot and you are allowed salt.",
      "Eat something with potassium (potato, fruit, beans) later.",
    ],
    howToUse: "Every sauna or long hot yoga session.",
    safety: "Heart and kidney fluid limits still apply. Don’t overdrink.",
    seeDoctorIf: "You have heart failure, CKD, or a low-salt prescription.",
    pillars: ["recovery", "minerals"],
  },
  {
    id: "liver-love-plate",
    title: "Bitter & beet plate",
    category: "metabolic",
    summary:
      "Crucifers, beet, and olive oil. A food-first ‘liver love’ plate — not a cleanse kit.",
    ingredients: [
      "Handful of cooked greens or slaw",
      "Beet or carrot",
      "Olive oil",
      "Protein on the side",
    ],
    steps: [
      "Put plants and protein on the plate.",
      "Chew. Don’t juice this into a ‘shot’ if chewing is the point.",
      "Repeat a few times a week.",
    ],
    howToUse: "Hyman-style food foundation. Variety beats a 3-day juice.",
    safety: "Oxalate-sensitive kidneys: don’t live on raw spinach and beets only.",
    seeDoctorIf: "Known liver disease — food helps; it does not replace care.",
    pillars: ["metabolic", "inflammation"],
  },
  {
    id: "chew-slow-meal",
    title: "Sit-and-chew meal",
    category: "digestion",
    summary:
      "The unsexy functional gut protocol: chair, fork down, 15 minutes.",
    ingredients: ["A real meal", "Chair", "No laptop"],
    steps: [
      "Sit. Put screens away.",
      "Put the fork down between bites.",
      "Stop at comfortable fullness.",
    ],
    howToUse: "Once a day is a strong start.",
    safety: "Don’t turn this into restriction if you have a history of disordered eating — eat enough.",
    seeDoctorIf: "Pain with swallowing or food getting stuck.",
    pillars: ["gut", "metabolic"],
  },
  {
    id: "nasal-walk",
    title: "Nasal-breathing easy walk",
    category: "energy",
    summary:
      "Walk at a pace you can keep nasal. A Huberman-adjacent zone-2 cue without gadgets.",
    ingredients: ["10–20 minutes", "Shoes"],
    steps: [
      "Close the mouth if it feels easy.",
      "Slow down if you start gasping.",
      "Finish with a few slower breaths.",
    ],
    howToUse: "Daily easy movement. Not a breath-hold contest.",
    safety: "Mouth-breathe if you need to. Don’t force nasal through a cold.",
    seeDoctorIf: "Chest pain or you can’t walk a flat block.",
    pillars: ["metabolic", "stress"],
  },
];
