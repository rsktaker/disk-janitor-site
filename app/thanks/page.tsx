import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const REPO_URL = 'https://github.com/rsktaker/disk-janitor';

type LicenseResponse = {
  key?: string;
  email?: string | null;
  error?: string;
};

async function fetchLicense(sessionId: string): Promise<LicenseResponse> {
  const h = await headers();
  const host = h.get('host') ?? 'diskjanitor.com';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const url = `${proto}://${host}/api/license/${encodeURIComponent(sessionId)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return (await res.json()) as LicenseResponse;
  } catch {
    return { error: 'fetch_failed' };
  }
}

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-bold">Missing session</h1>
        <p className="mt-3 text-[color:var(--color-muted)]">
          This URL needs a <code>session_id</code>. If you just paid via Stripe, check
          your email for the receipt — it should contain the link back here.
        </p>
      </main>
    );
  }

  const data = await fetchLicense(sessionId);

  if (data.error || !data.key) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-bold">Hmm, something's not right</h1>
        <p className="mt-3 text-[color:var(--color-muted)]">
          We couldn't find your license. If your payment went through, your receipt email
          will have a link to return here. Otherwise{' '}
          <a className="underline" href={`${REPO_URL}/issues`}>
            open an issue
          </a>{' '}
          and we'll fix it.
        </p>
        <p className="mt-3 text-xs text-[color:var(--color-muted)]">
          Detail: {data.error ?? 'no_key'}
        </p>
      </main>
    );
  }

  const deepLink = `diskjanitor://license/${encodeURIComponent(data.key)}`;

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
      <div className="mb-2 text-sm tracking-wider text-[color:var(--color-accent)] uppercase">
        Payment received · Disk Janitor License
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
        Thanks. You're unlocked.
      </h1>
      <p className="mt-6 text-lg text-[color:var(--color-muted)] leading-relaxed">
        Your license key is below. Click the green button to deep-link it back into
        Disk Janitor automatically. If that doesn't work, copy the key and paste it
        into Disk Janitor's gear menu → Enter License.
      </p>

      <div className="mt-8 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6">
        <div className="text-xs uppercase tracking-wider text-[color:var(--color-muted)] mb-2">
          License Key
        </div>
        <div
          className="font-mono text-lg select-all break-all"
          style={{ userSelect: 'all' }}
        >
          {data.key}
        </div>
        {data.email && (
          <div className="mt-3 text-xs text-[color:var(--color-muted)]">
            Linked to {data.email}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={deepLink}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-5 py-3 text-base font-semibold text-[color:var(--color-bg)] hover:opacity-90"
        >
          Open in Disk Janitor
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-5 py-3 text-base font-medium hover:bg-[color:var(--color-card)]"
        >
          Back to home
        </a>
      </div>

      <div className="mt-12 text-sm text-[color:var(--color-muted)] space-y-2">
        <p>Save this email-receipt page link as a backup. Your license is permanent and tied to nothing — it works on any Mac you install Disk Janitor on.</p>
        <p>
          Questions or issues:{' '}
          <a className="underline underline-offset-2" href={`${REPO_URL}/issues`}>
            file an issue on GitHub
          </a>
          .
        </p>
      </div>
    </main>
  );
}
