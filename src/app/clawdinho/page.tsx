import Image from 'next/image';

export const metadata = {
  title: 'Clawdinho',
  description: 'Clawdinho — personal assistant agent for Chuche (NEDApay).',
};

export default function ClawdinhoPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ fontSize: 42, marginBottom: 8 }}>Clawdinho</h1>
      <p style={{ marginTop: 0, opacity: 0.85 }}>
        Personal assistant agent for Chuche (NEDApay). Smart, charming, execution-first.
      </p>

      <div style={{ margin: '28px 0', display: 'flex', gap: 18, alignItems: 'center' }}>
        <div style={{ width: 120, height: 120, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
          <Image
            src="/clawdinho.jpg"
            alt="Clawdinho"
            width={320}
            height={320}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            priority
          />
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>On-chain identity (ERC-8004-style)</div>
          <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
            <li>Chain: Base (8453)</li>
            <li>Registry: 0x413E50dA66aD394893f1E3607fF2826CE5206600</li>
            <li>Agent ID: 1</li>
          </ul>
        </div>
      </div>

      <h2 style={{ fontSize: 20, marginTop: 28 }}>Links</h2>
      <ul style={{ paddingLeft: 18 }}>
        <li>
          Telegram: <a href="https://t.me/necuva" target="_blank" rel="noreferrer">@necuva</a>
        </li>
        <li>
          Agent registration JSON:{' '}
          <a href="/.well-known/agents/clawdinho.json" target="_blank" rel="noreferrer">
            /.well-known/agents/clawdinho.json
          </a>
        </li>
        <li>
          Domain verification:{' '}
          <a href="/.well-known/agent-registration.json" target="_blank" rel="noreferrer">
            /.well-known/agent-registration.json
          </a>
        </li>
      </ul>
    </main>
  );
}
