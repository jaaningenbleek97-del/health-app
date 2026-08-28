export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-sage-600/80 leading-relaxed">
        Wellness education only — not medical advice, diagnosis, or treatment.
        Talk to a clinician before changing supplements or remedies.
      </p>
    );
  }
  return (
    <div className="rounded-xl border border-terracotta-100 bg-terracotta-50/80 px-3 py-2.5 text-xs text-terracotta-800 leading-relaxed">
      <strong className="font-semibold">Not medical advice.</strong> Natura
      shares general wellness information inspired by functional-medicine and
      performance-wellness ideas (sleep, light, food, minerals). It is not
      affiliated with Andrew Huberman, Gary Brecka, Mark Hyman, or any clinic.
      RDI bars are adult reference values, not your personal prescription. It
      does not diagnose, treat, cure, or prevent disease. Check with a
      clinician before changing supplements — especially if you are pregnant,
      breastfeeding, take medications, or have a health condition.
    </div>
  );
}
