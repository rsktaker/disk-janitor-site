const REPO = 'rsktaker/disk-janitor';
const REPO_URL = `https://github.com/${REPO}`;

type Release = {
  version: string;
  dmgUrl: string | null;
  publishedAt: string | null;
};

async function getLatestRelease(): Promise<Release | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { next: { revalidate: 60 }, headers: { Accept: 'application/vnd.github+json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const dmg = (data.assets ?? []).find((a: { name: string; browser_download_url: string }) =>
      a.name.toLowerCase().endsWith('.dmg')
    );
    return {
      version: data.tag_name ?? 'unknown',
      dmgUrl: dmg?.browser_download_url ?? null,
      publishedAt: data.published_at ?? null,
    };
  } catch {
    return null;
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function Home() {
  const release = await getLatestRelease();
  const downloadUrl =
    release?.dmgUrl ?? `${REPO_URL}/releases/latest`;

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 sm:py-28">
      <div className="mb-2 text-sm tracking-wider text-[color:var(--color-muted)] uppercase">
        Disk Janitor
      </div>
      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
        Clean your Mac<br />
        without losing your <span className="text-[color:var(--color-accent)]">logins</span>.
      </h1>
      <p className="mt-6 text-lg text-[color:var(--color-muted)] leading-relaxed">
        A tiny Mac app that finds the big files on your disk and asks AI to
        explain each one in plain English. Trash the cached junk, keep your
        logins and settings — chat with AI about anything you&apos;re unsure of.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={downloadUrl}
          className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-5 py-3 text-base font-semibold text-[color:var(--color-bg)] transition hover:opacity-90"
        >
          <span>Download for Mac</span>
          {release?.version && (
            <span className="text-sm font-normal opacity-80">{release.version}</span>
          )}
        </a>
        <a
          href={REPO_URL}
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--color-border)] px-5 py-3 text-base font-medium hover:bg-[color:var(--color-card)] transition"
        >
          View on GitHub
        </a>
      </div>

      <div className="mt-3 text-xs text-[color:var(--color-muted)]">
        Universal binary · macOS 14 (Sonoma)+ · {release?.publishedAt && `Released ${formatDate(release.publishedAt)} · `}
        Bring your own{' '}
        <a
          className="underline underline-offset-2 hover:text-[color:var(--color-fg)]"
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noreferrer"
        >
          Anthropic API key
        </a>
      </div>

      <hr className="my-14 border-[color:var(--color-border)]" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Feature title="Plain-English summaries" body="Every big folder gets one sentence telling you what it actually is, written for someone who's never heard the word 'cache'." />
        <Feature title="Login is always separated" body="Spotify's login folder shows up as its own row, separate from its 7 GB of cached audio. Trash one, keep the other." />
        <Feature title="Ask AI about anything" body="Click 'Ask AI' on any item to open a floating chat window. Ask 'will this sign me out?' and get a direct answer." />
        <Feature title="Find duplicates" body="SHA-256 content hash across Documents/Downloads/Desktop/Movies. Catches duplicates regardless of filename." />
        <Feature title="One-click safe cleanup" body="'Select safe items' picks only the rows the AI is fully confident about. Move to Trash. Empty Trash. Done." />
        <Feature title="Bring your own AI key" body="Your Anthropic API key lives only in macOS Keychain. Never sent anywhere except api.anthropic.com." />
      </div>

      <hr className="my-14 border-[color:var(--color-border)]" />

      <div className="text-sm text-[color:var(--color-muted)] space-y-3">
        <p>
          <strong className="text-[color:var(--color-fg)]">Open source.</strong>{' '}
          MIT-licensed. <a href={REPO_URL} className="underline underline-offset-2 hover:text-[color:var(--color-fg)]">Read the code</a>,{' '}
          <a href={`${REPO_URL}/issues`} className="underline underline-offset-2 hover:text-[color:var(--color-fg)]">file an issue</a>, or{' '}
          <a href={`${REPO_URL}/releases`} className="underline underline-offset-2 hover:text-[color:var(--color-fg)]">see all releases</a>.
        </p>
        <p>
          <strong className="text-[color:var(--color-fg)]">Signed and notarized by Apple</strong> — opens normally, no Gatekeeper warnings.
        </p>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-[color:var(--color-muted)] leading-relaxed">{body}</p>
    </div>
  );
}
