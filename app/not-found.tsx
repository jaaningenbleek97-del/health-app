import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-sage-900">Page not found</h1>
      <p className="text-sm text-sage-600">That path isn’t part of Natura.</p>
      <Link href="/" className="btn-primary inline-flex">
        Back home
      </Link>
    </div>
  );
}
