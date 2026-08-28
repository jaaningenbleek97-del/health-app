"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { findRemedy } from "@/lib/catalog";
import { useNaturaStore } from "@/lib/store";

export default function RemedyDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const customRemedies = useNaturaStore((s) => s.customRemedies);
  const remedy = findRemedy(id, customRemedies);
  const favorites = useNaturaStore((s) => s.favoriteRemedyIds);
  const toggle = useNaturaStore((s) => s.toggleFavoriteRemedy);
  const removeCustom = useNaturaStore((s) => s.removeCustomRemedy);

  if (!remedy) {
    return (
      <div className="mx-auto max-w-2xl">
        <p>Remedy not found.</p>
        <Link href="/remedies" className="btn-secondary mt-3 inline-flex">
          Back
        </Link>
      </div>
    );
  }

  const fav = favorites.includes(remedy.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/remedies" className="text-sm font-medium text-sage-700">
        ← All remedies
      </Link>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="chip">{remedy.category}</span>
          <h1 className="mt-2 text-2xl font-bold text-sage-900">
            {remedy.title}
          </h1>
          <p className="mt-1 text-sm text-sage-600">{remedy.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(remedy.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            fav ? "bg-terracotta-100 text-terracotta-800" : "bg-cream-100 text-sage-700"
          }`}
        >
          {fav ? "Favorited" : "Favorite"}
        </button>
      </div>

      <DisclaimerBanner />

      <section className="card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-500">
          Ingredients
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-sage-800">
          {remedy.ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>

      <section className="card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-sage-500">
          Steps
        </h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-sage-800">
          {remedy.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="card p-4 space-y-3 text-sm">
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            How to use
          </h2>
          <p className="mt-1 text-sage-800">{remedy.howToUse}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">Safety</h2>
          <p className="mt-1 text-sage-800">{remedy.safety}</p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-sage-500">
            See a doctor if
          </h2>
          <p className="mt-1 text-sage-800">{remedy.seeDoctorIf}</p>
        </div>
      </section>
      {remedy.custom && (
        <button
          type="button"
          className="w-full text-sm text-terracotta-700 underline"
          onClick={() => {
            removeCustom(remedy.id);
            window.location.href = "/remedies";
          }}
        >
          Delete this custom remedy
        </button>
      )}
    </div>
  );
}
