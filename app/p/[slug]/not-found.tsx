import Link from "next/link";

export default function PersonNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Surf emoji illustration */}
        <div className="mb-8 text-8xl opacity-20">🏄</div>

        <h1 className="mb-4 text-3xl font-semibold sm:text-4xl">
          Profile not found
        </h1>
        <p className="mb-8 text-base leading-relaxed text-text-secondary">
          This profile doesn&apos;t exist or has been removed.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/people" className="btn-primary">
            Browse People
          </Link>
          <Link href="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
