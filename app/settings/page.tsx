"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { downloadJson } from "@/lib/backup";
import { todayKey } from "@/lib/dates";
import { useNaturaStore } from "@/lib/store";
import {
  notificationSupported,
  requestNotificationPermission,
} from "@/lib/reminders";

export default function SettingsPage() {
  const displayName = useNaturaStore((s) => s.displayName);
  const setDisplayName = useNaturaStore((s) => s.setDisplayName);
  const resetAll = useNaturaStore((s) => s.resetAll);
  const notificationsEnabled = useNaturaStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useNaturaStore(
    (s) => s.setNotificationsEnabled
  );
  const soundEnabled = useNaturaStore((s) => s.soundEnabled);
  const setSoundEnabled = useNaturaStore((s) => s.setSoundEnabled);
  const exportBackup = useNaturaStore((s) => s.exportBackup);
  const importBackup = useNaturaStore((s) => s.importBackup);
  const setOnboardingComplete = useNaturaStore((s) => s.setOnboardingComplete);
  const rdiProfile = useNaturaStore((s) => s.rdiProfile);
  const setRdiProfile = useNaturaStore((s) => s.setRdiProfile);

  const [name, setName] = useState(displayName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [note, setNote] = useState("");
  const [backupNote, setBackupNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  async function onNotify() {
    if (!notificationSupported()) {
      setNote("Notifications are not available in this browser.");
      return;
    }
    const ok = await requestNotificationPermission();
    setNotificationsEnabled(ok);
    setNote(ok ? "Permission granted." : "Permission not granted.");
  }

  function onExport() {
    downloadJson(`natura-backup-${todayKey()}.json`, exportBackup());
    setBackupNote("Backup downloaded. Keep it somewhere safe on this device.");
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const ok = importBackup(parsed);
      setBackupNote(
        ok
          ? "Backup restored on this device."
          : "That file does not look like a Natura backup."
      );
    } catch {
      setBackupNote("Could not read that file.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-sage-900">More</h1>
        <p className="mt-1 text-sm text-sage-600">
          All data stays in this browser. Export a backup before clearing site
          data.
        </p>
      </div>

      <section className="card space-y-2 p-4">
        <h2 className="font-semibold">Your data</h2>
        <Link href="/plan" className="btn-secondary w-full">
          Weekly plan
        </Link>
        <Link href="/remedies" className="btn-secondary w-full">
          Remedies
        </Link>
        <Link href="/history" className="btn-secondary w-full">
          4-week history
        </Link>
        <Link href="/search" className="btn-secondary w-full">
          Search everything
        </Link>
        <Link href="/fitness/new" className="block text-center text-sm font-medium text-sage-700">
          Custom workout
        </Link>
        <Link href="/supplements/new" className="block text-center text-sm font-medium text-sage-700">
          Custom bottle
        </Link>
        <Link href="/remedies/new" className="block text-center text-sm font-medium text-sage-700">
          Custom remedy
        </Link>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Your name</h2>
        <input
          className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm"
          placeholder="Optional"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary w-full"
          onClick={() => setDisplayName(name.trim())}
        >
          Save
        </button>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">RDI profile</h2>
        <p className="text-sm text-sage-600">
          Used for supplement % bars. Adult 19–50 NIH/ODS-style values. Not a lab
          result and not personal medical advice.
        </p>
        <select
          className="w-full rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm"
          value={rdiProfile}
          onChange={(e) =>
            setRdiProfile(e.target.value as "general" | "male" | "female")
          }
        >
          <option value="general">Adult (average of male/female)</option>
          <option value="male">Adult male</option>
          <option value="female">Adult female</option>
        </select>
        <Link href="/stack" className="block text-center text-sm font-medium text-sage-700">
          View supplement RDI
        </Link>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Notifications</h2>
        <p className="text-sm text-sage-600">
          {notificationsEnabled ? "Enabled" : "Not enabled"} · alerts only fire
          while the app tab is open on most phones.
        </p>
        <button type="button" className="btn-secondary w-full" onClick={onNotify}>
          Request permission
        </button>
        {note && <p className="text-xs text-sage-600">{note}</p>}
        <Link href="/reminders" className="block text-center text-sm font-medium text-sage-700">
          Edit reminders
        </Link>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Workout sounds</h2>
        <label className="flex items-center justify-between text-sm">
          <span>Beep when a step ends</span>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
        </label>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Backup</h2>
        <p className="text-sm text-sage-600">
          Download or restore your weekly plan, supplements, logs, reminders, and
          favorites as JSON. Nothing leaves this device unless you move the
          file.
        </p>
        <button type="button" className="btn-primary w-full" onClick={onExport}>
          Export backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            void onImport(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => fileRef.current?.click()}
        >
          Import backup
        </button>
        {backupNote && <p className="text-xs text-sage-600">{backupNote}</p>}
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Install on your phone</h2>
        <p className="text-sm text-sage-600">
          In your browser menu, choose <strong>Add to Home Screen</strong>.
          After the first visit, pages stay available offline.
        </p>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold">Setup</h2>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => setOnboardingComplete(false)}
        >
          Replay welcome setup
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Full disclaimer</h2>
        <DisclaimerBanner />
        <p className="text-xs leading-relaxed text-sage-600">
          Herbs, vitamins, and home remedies can interact with medications and
          are unsafe in some conditions. Natura does not sell products and does
          not replace emergency care. If you think you are having a medical
          emergency, contact local emergency services.
        </p>
      </section>

      <section className="card space-y-3 p-4">
        <h2 className="font-semibold text-terracotta-800">Reset local data</h2>
        <p className="text-sm text-sage-600">
          Clears your weekly plan, supplements, reminders, favorites, workout log, and
          name on this device.
        </p>
        {!confirmReset ? (
          <button
            type="button"
            className="btn-secondary w-full text-terracotta-800"
            onClick={() => setConfirmReset(true)}
          >
            Reset everything
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1 bg-terracotta-600 hover:bg-terracotta-700"
              onClick={() => {
                resetAll();
                setName("");
                setConfirmReset(false);
              }}
            >
              Confirm reset
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
