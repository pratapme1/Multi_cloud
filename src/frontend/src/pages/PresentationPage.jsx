import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFiles, getHealth } from '../api/index.js';
import './PresentationPage.css';

// ── Helpers ──────────────────────────────────────────────────────────

function CountUp({ to = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) { setVal(0); return; }
    let start;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [to, duration]);
  return <>{val}</>;
}

function Countdown({ target }) {
  const [diff, setDiff] = useState(() => target - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>LIVE 🚀</div>;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  return (
    <div className="countdown">
      {[['Days', days], ['Hrs', hours], ['Min', mins], ['Sec', secs]].map(([label, num]) => (
        <div key={label} className="cd-block">
          <div className="cd-num">{String(num).padStart(2, '0')}</div>
          <div className="cd-label">{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Slide 1 — Hero ───────────────────────────────────────────────────

function SlideHero() {
  const floats = [
    { top: '8%',  left: '1%',   bg: 'rgba(255,107,107,.14)', border: 'rgba(255,107,107,.35)', color: '#ff6b6b', size: 52, sym: '{ }', dur: 3.8, delay: '0s' },
    { top: '72%', left: '-1%',  bg: 'rgba(255,217,61,.12)',  border: 'rgba(255,217,61,.32)',  color: '#ffd93d', size: 46, sym: '→',   dur: 4.2, delay: '.7s' },
    { top: '12%', right: '1%',  bg: 'rgba(6,182,212,.12)',   border: 'rgba(6,182,212,.32)',   color: '#22d3ee', size: 50, sym: '⟳',   dur: 3.5, delay: '1.3s' },
    { top: '68%', right: '0%',  bg: 'rgba(168,85,247,.12)',  border: 'rgba(168,85,247,.32)',  color: '#c084fc', size: 54, sym: '∞',   dur: 4.6, delay: '.3s' },
    { top: '42%', left: '-2%',  bg: 'rgba(16,185,129,.11)',  border: 'rgba(16,185,129,.3)',   color: '#34d399', size: 40, sym: '✦',   dur: 5.0, delay: '1.9s' },
    { top: '38%', right: '-1%', bg: 'rgba(245,158,11,.11)',  border: 'rgba(245,158,11,.3)',   color: '#fbbf24', size: 44, sym: '⬡',   dur: 4.0, delay: '1.1s' },
  ];
  return (
    <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto', position: 'relative' }}>
      {floats.map((f, i) => (
        <div key={i} className="pres-float" style={{
          top: f.top, left: f.left, right: f.right,
          width: f.size, height: f.size,
          background: f.bg, border: `1px solid ${f.border}`, color: f.color,
          fontSize: f.size * 0.3,
          animation: `${i % 2 === 0 ? 'floatBob' : 'floatBobAlt'} ${f.dur}s ease-in-out ${f.delay} infinite`,
        }}>{f.sym}</div>
      ))}
      <div className="sa sa-1" style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
        <span className="pb pb-aws"><span className="pd pd-aws" />AWS S3</span>
        <span className="pb pb-azure"><span className="pd pd-azure" />Azure Blob</span>
        <span className="pb pb-gcs"><span className="pd pd-gcs" />GCS</span>
      </div>
      <div className="sa sa-2"><div className="pt-label">All Milestones Complete · June 2026</div></div>
      <div className="sa sa-3">
        <h1 className="pt-h1">
          <span className="pt-grad">Multi-Cloud</span><br />
          Storage Integration
        </h1>
      </div>
      <div className="sa sa-4">
        <p className="pt-body" style={{ maxWidth: 540, margin: '0 auto 28px' }}>
          A unified interface over the world's three major cloud storage providers —
          upload once, sync everywhere, control who sees what.
        </p>
      </div>
      <div className="sa sa-5" style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Press → to begin</span>
        <span className="arrow-hint" style={{ fontSize: 20, color: 'rgba(255,255,255,.4)' }}>→</span>
      </div>
    </div>
  );
}

// ── Slide 2 — Problem / Solution ─────────────────────────────────────

function SlidePlatform() {
  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Why we built this</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>One console. Three clouds.</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="pg-card panel-before sa sa-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#ef4444' }}>✕</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#ef4444' }}>Before</span>
          </div>
          {[
            ['3 Separate Consoles', 'AWS Console, Azure Portal, GCP Console — all separate'],
            ['Vendor Lock-in', 'Moving files between clouds requires manual effort'],
            ['No Unified Access', 'Different IAM policies and RBAC per provider'],
            ['No Single View', 'No combined file list, health status, or audit trail'],
          ].map(([t, d]) => (
            <div key={t} style={{ marginBottom: 13, paddingLeft: 10, borderLeft: '2px solid rgba(239,68,68,.25)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(239,68,68,.85)', marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>
        <div className="pg-card panel-after sa sa-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(79,142,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#4f8eff' }}>✓</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#4f8eff' }}>After</span>
          </div>
          {[
            ['Single Dashboard', 'One React UI — all three providers at a glance'],
            ['Smart Sync', 'One click to replicate any file across all clouds'],
            ['Role-Based Access', 'Super Admin, Admin, Viewer — one JWT auth layer'],
            ['Live Health Monitor', 'Real-time latency and status across all providers'],
          ].map(([t, d]) => (
            <div key={t} style={{ marginBottom: 13, paddingLeft: 10, borderLeft: '2px solid rgba(79,142,255,.35)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6fa8ff', marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide 3 — Architecture ───────────────────────────────────────────

function SlideArch() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
        <div>
          <div className="sa sa-1"><div className="pt-label">System architecture</div></div>
          <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 0 }}>How it all connects</h2></div>
        </div>
      </div>

      <div className="sa sa-3">
        <svg viewBox="0 0 780 285" width="100%" style={{ maxHeight: 285, display: 'block' }}>
          <defs>
            <path id="pBrowserApi" d="M390 62 L390 112" />
            <path id="pApiAws"     d="M350 170 Q195 205 162 248" />
            <path id="pApiAzure"   d="M390 170 L390 248" />
            <path id="pApiGcs"     d="M430 170 Q590 205 618 248" />
          </defs>

          {/* Browser node */}
          <rect x="290" y="8" width="200" height="54" rx="12" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
          <text x="390" y="30" textAnchor="middle" fill="rgba(255,255,255,.9)" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Browser · React UI</text>
          <text x="390" y="49" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="10" fontFamily="Inter,system-ui">Vite · Port 5173</text>

          {/* API node — glowing */}
          <rect x="274" y="115" width="232" height="54" rx="12" fill="rgba(79,142,255,.15)" stroke="rgba(79,142,255,.6)" strokeWidth="2" filter="url(#apiGlow)" />
          <text x="390" y="137" textAnchor="middle" fill="#7eb8ff" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Node.js · Express API</text>
          <text x="390" y="155" textAnchor="middle" fill="rgba(79,142,255,.7)" fontSize="10" fontFamily="Inter,system-ui">REST · Bearer Auth · Vercel</text>

          {/* Provider nodes — vivid */}
          <rect x="70"  y="248" width="185" height="36" rx="10" fill="rgba(255,153,0,.14)"  stroke="rgba(255,153,0,.5)"  strokeWidth="1.5" />
          <text x="163" y="266" textAnchor="middle" fill="#ffb347" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">AWS S3</text>
          <text x="163" y="280" textAnchor="middle" fill="rgba(255,153,0,.5)" fontSize="9" fontFamily="Inter,system-ui">S3Client · us-east-1</text>
          <rect x="297" y="248" width="185" height="36" rx="10" fill="rgba(79,159,245,.13)" stroke="rgba(79,159,245,.5)" strokeWidth="1.5" />
          <text x="390" y="266" textAnchor="middle" fill="#80b8f8" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Azure Blob</text>
          <text x="390" y="280" textAnchor="middle" fill="rgba(79,159,245,.5)" fontSize="9" fontFamily="Inter,system-ui">BlobServiceClient</text>
          <rect x="525" y="248" width="185" height="36" rx="10" fill="rgba(52,168,83,.13)"  stroke="rgba(52,168,83,.5)"  strokeWidth="1.5" />
          <text x="618" y="266" textAnchor="middle" fill="#5dd888" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">GCS</text>
          <text x="618" y="280" textAnchor="middle" fill="rgba(52,168,83,.5)" fontSize="9" fontFamily="Inter,system-ui">@google-cloud/storage</text>

          {/* Glow filter */}
          <defs>
            <filter id="apiGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          {/* Static dashed connectors — more vivid */}
          <line x1="390" y1="62" x2="390" y2="115" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M350 169 Q195 205 162 248" fill="none" stroke="rgba(255,153,0,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="390" y1="169" x2="390" y2="248"                                     stroke="rgba(79,159,245,.35)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M430 169 Q590 205 618 248" fill="none" stroke="rgba(52,168,83,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Animated flow dots — browser → API */}
          {[0, 1.4].map((d, i) => (
            <circle key={`b${i}`} r="4" fill="#4f8eff" opacity="0">
              <animateMotion dur="2.2s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pBrowserApi" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* API → AWS */}
          {[0, 2.0].map((d, i) => (
            <circle key={`aws${i}`} r="3.5" fill="#ff9900" opacity="0">
              <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAws" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* API → Azure */}
          {[0.5, 2.3].map((d, i) => (
            <circle key={`az${i}`} r="3.5" fill="#4f9ff5" opacity="0">
              <animateMotion dur="2.5s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAzure" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* API → GCS */}
          {[1.0, 2.7].map((d, i) => (
            <circle key={`gcs${i}`} r="3.5" fill="#34c674" opacity="0">
              <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiGcs" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      <div className="sa sa-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
        {[
          ['Upload', 'Browser → Signed URL → Provider'],
          ['Sync',   'API → listFiles → copy → upload'],
          ['Auth',   'Supabase JWT → Bearer token'],
        ].map(([label, val]) => (
          <div key={label} className="pg-card" style={{ padding: '10px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.65)' }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 4 — Live Dashboard ──────────────────────────────────────────

function SlideLive({ liveData }) {
  const loading = !liveData;
  const files   = liveData?.files ?? [];
  const health  = liveData?.health;

  const totalFiles = files.length;
  const provCount  = { aws: 0, azure: 0, gcs: 0 };
  files.forEach(f => f.providers?.forEach(p => { if (p in provCount) provCount[p]++; }));

  const healthMap = {};
  health?.providers?.forEach(p => { if (p.key) healthMap[p.key] = p; });

  const PL = { aws: 'AWS S3', azure: 'Azure Blob', gcs: 'GCS' };
  const PC = { aws: '#ff9900', azure: '#4f9ff5', gcs: '#34c674' };
  const barKey = loading ? 'loading' : 'loaded';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div className="sa sa-1"><h2 className="pt-h2" style={{ margin: 0 }}>Live Platform</h2></div>
        <div className="sa sa-2"><span className="live-badge"><span className="live-badge-dot" />LIVE</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 14 }}>

        {/* Big file count */}
        <div className="pg-card sa sa-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,217,61,.5)', textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 700 }}>Total Files</div>
          <div className="pres-num">{loading ? '—' : <CountUp to={totalFiles} />}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)' }}>across all providers</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Health status */}
          <div className="pg-card sa sa-4" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Provider Health</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {['aws', 'azure', 'gcs'].map(key => {
                const ph = healthMap[key];
                const ok = ph?.status === 'ok';
                const statusColor = loading ? 'rgba(255,255,255,.15)' : ok ? '#10b981' : '#ef4444';
                return (
                  <div key={key} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, flexShrink: 0, animation: ok && !loading ? 'blinkDot 2.5s ease-in-out infinite' : 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: statusColor }}>
                        {loading ? '…' : ok ? 'Healthy' : 'Error'}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.28)' }}>{PL[key]}</div>
                    </div>
                    {ph?.latencyMs != null && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', flexShrink: 0 }}>{ph.latencyMs} ms</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* File distribution bars */}
          <div className="pg-card sa sa-5" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>File Distribution</div>
            {['aws', 'azure', 'gcs'].map(key => {
              const count = provCount[key];
              const pct   = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>{PL[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: loading ? 'rgba(255,255,255,.2)' : PC[key] }}>{loading ? '—' : count}</span>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div
                      key={`${barKey}-${key}`}
                      className="bar-anim"
                      style={{ height: '100%', borderRadius: 99, background: PC[key], width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide 5 — Features ───────────────────────────────────────────────

function SlideFeatures() {
  const cards = [
    { icon: '☁',  color: '#4f8eff', bg: 'rgba(79,142,255,.12)', title: 'Unified Upload',      desc: 'Upload once and replicate to all three clouds simultaneously via direct signed URLs.' },
    { icon: '↔',  color: '#a855f7', bg: 'rgba(168,85,247,.12)', title: 'Smart Sync',           desc: 'Sync any file from any source to any target — skips existing files automatically.' },
    { icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', title: 'Health Monitor',       desc: 'Real-time health checks across all providers with latency metrics.' },
    { icon: '🔐', color: '#10b981', bg: 'rgba(16,185,129,.12)', title: 'Role-Based Access',    desc: 'Super Admin, Admin, Viewer. Supabase JWT auth with invite-link onboarding.' },
    { icon: '↓',  color: '#06b6d4', bg: 'rgba(6,182,212,.12)',  title: 'Per-Provider Download','desc': 'Stream files directly from the provider of your choice.' },
    { icon: '✕',  color: '#ef4444', bg: 'rgba(239,68,68,.12)',  title: 'Per-Provider Remove',  desc: 'Delete a file from one provider while keeping it safe on others.' },
    { icon: '📋', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', title: 'Audit History',        desc: 'Per-file live action log — every sync, remove, and download recorded in-session.' },
    { icon: '🔄', color: '#22d3ee', bg: 'rgba(34,211,238,.12)', title: 'Auto Refresh',         desc: 'File list updates automatically after every action. No manual refresh needed.' },
  ];

  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Feature set</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 18 }}>Everything you need</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11 }}>
        {cards.map((c, i) => (
          <div key={c.title} className={`pg-card sa sa-${Math.min(i + 2, 6)}`}
            style={{ padding: '16px', borderColor: c.color + '45', boxShadow: `0 8px 28px rgba(0,0,0,.4), inset 0 0 30px ${c.color}08` }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: c.bg, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10, boxShadow: `0 4px 12px ${c.color}20` }}>{c.icon}</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 6 — Security ───────────────────────────────────────────────

function SlideSecurity() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Security & access control</div></div>
        <div className="sa sa-2"><h2 className="pt-h2">Enterprise-grade<br />access model</h2></div>
        <div className="sa sa-3"><p className="pt-body" style={{ fontSize: 12.5, marginBottom: 18 }}>Three-tier role hierarchy with Supabase JWT. Invite-link onboarding — no open self-registration.</p></div>

        {[
          { name: 'Super Admin', color: '#a855f7', perms: ['Upload', 'Download', 'Delete', 'Sync', 'Manage Roles', 'View Health'] },
          { name: 'Admin',       color: '#4f8eff', perms: ['Upload', 'Download', 'Delete', 'Sync', 'View Health'] },
          { name: 'Viewer',      color: '#10b981', perms: ['Download', 'View Health'] },
        ].map((r, i) => (
          <div key={r.name} className={`sa sa-${i + 4}`} style={{ marginBottom: 10, background: r.color + '10', border: `1px solid ${r.color}22`, borderRadius: 12, padding: '13px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.name}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.perms.map(p => (
                <span key={p} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pg-card sa sa-2" style={{ marginTop: 52 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 16 }}>Auth Flow</div>
        {[
          ['Super Admin creates invite link',        '#a855f7'],
          ['User registers with invite token',       '#4f8eff'],
          ['Supabase issues JWT with role claim',    '#10b981'],
          ['Frontend stores token, sends as Bearer', '#f59e0b'],
          ['Backend verifies on every API request',  '#ef4444'],
        ].map(([text, color], i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 13, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: color + '22', border: `1px solid ${color}44`, color, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.48)', paddingTop: 3, lineHeight: 1.45 }}>{text}</div>
          </div>
        ))}
        <div className="grad-sep" />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <span className="pb pb-aws" style={{ fontSize: 11, padding: '3px 10px' }}><span className="pd pd-aws" />AWS SDK v3</span>
          <span className="pb pb-azure" style={{ fontSize: 11, padding: '3px 10px' }}><span className="pd pd-azure" />Azure Blob</span>
          <span className="pb pb-gcs" style={{ fontSize: 11, padding: '3px 10px' }}><span className="pd pd-gcs" />GCS</span>
        </div>
      </div>
    </div>
  );
}

// ── Slide 7 — Tech Stack ─────────────────────────────────────────────

function SlideStack() {
  const items = [
    { abbr: 'JS',  name: 'Node.js',   sub: 'Express · REST API',         color: '#68a063' },
    { abbr: '⚛',  name: 'React',     sub: 'Vite · Bootstrap 5',         color: '#61dafb' },
    { abbr: 'AWS', name: 'AWS SDK',   sub: 'v3 · S3Client · Presigner',  color: '#ff9900' },
    { abbr: 'AZ',  name: 'Azure SDK', sub: '@azure/storage-blob',        color: '#4f9ff5' },
    { abbr: 'G',   name: 'GCS SDK',   sub: '@google-cloud/storage',      color: '#34c674' },
    { abbr: 'SB',  name: 'Supabase',  sub: 'Auth · JWT · Postgres',      color: '#3ecf8e' },
    { abbr: '▲',   name: 'Vercel',    sub: 'Serverless · Edge · CI/CD',  color: '#e6e6e6' },
    { abbr: 'DB',  name: 'SQLite',    sub: 'better-sqlite3 · M3 scope',  color: '#8a8a8a' },
  ];

  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Technology</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 22 }}>Built on solid foundations</h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {items.map((item, i) => (
          <div key={item.name} className={`sa sa-${Math.min(i + 2, 6)}`}>
            <div className="stack-card">
              <div style={{ width: 44, height: 44, borderRadius: 14, background: item.color + '18', border: `1px solid ${item.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: item.color, margin: '0 auto 12px' }}>{item.abbr}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.32)', lineHeight: 1.4 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 8 — Go Live ────────────────────────────────────────────────

function SlideClosing() {
  const GO_LIVE = new Date('2026-06-16T09:00:00').getTime();

  const milestones = [
    { id: 'M1', label: 'API Modules',       date: 'Jun 5',  done: true, items: ['AWS S3 · Azure Blob · GCS', 'List · Upload · Download · Delete', 'Health checks · Signed URLs'] },
    { id: 'M2', label: 'Unified Interface', date: 'Jun 10', done: true, items: ['Cross-cloud sync', 'Redundant upload to 2+ providers', 'File management dashboard'] },
    { id: 'M3', label: 'Web UI + Deploy',   date: 'Jun 16', done: true, items: ['React UI · Auth · RBAC', 'Super Admin · Admin · Viewer roles', 'Deployed live on Vercel'] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Roadmap</div></div>
        <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>All milestones complete</h2></div>

        {milestones.map((m, i) => (
          <div key={m.id} className={`sa sa-${i + 3}`} style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div className={m.done ? 'ms-done-circle' : ''}
                style={{ width: 28, height: 28, borderRadius: '50%', background: m.done ? '#10b981' : 'rgba(255,255,255,.07)', border: `2px solid ${m.done ? '#10b981' : 'rgba(255,255,255,.14)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.done ? '#fff' : 'rgba(255,255,255,.28)', fontSize: 11, fontWeight: 800 }}>
                {m.done ? '✓' : m.id[1]}
              </div>
              {i < 2 && <div style={{ width: 2, height: 36, background: m.done ? 'linear-gradient(to bottom,rgba(16,185,129,.5),rgba(16,185,129,.15))' : 'rgba(255,255,255,.07)', marginTop: 4, borderRadius: 1 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: m.done ? '#10b981' : '#fff' }}>{m.id} · {m.label}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.28)', fontWeight: 600 }}>{m.date}</span>
                {m.done
                  ? <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: 'rgba(16,185,129,.15)', color: '#10b981', border: '1px solid rgba(16,185,129,.28)' }}>✓ DONE</span>
                  : <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.35)', border: '1px solid rgba(255,255,255,.1)' }}>PENDING</span>
                }
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {m.items.map(it => (
                  <span key={it} style={{ fontSize: 10.5, color: m.done ? 'rgba(16,185,129,.7)' : 'rgba(255,255,255,.32)', background: m.done ? 'rgba(16,185,129,.08)' : 'rgba(255,255,255,.05)', border: `1px solid ${m.done ? 'rgba(16,185,129,.2)' : 'rgba(255,255,255,.07)'}`, borderRadius: 6, padding: '2px 8px' }}>{it}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="pg-card sa sa-2" style={{ textAlign: 'center', marginTop: 52 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,217,61,.55)', marginBottom: 14 }}>Time to Go-Live</div>
          <Countdown target={GO_LIVE} />
          <div className="grad-sep" />
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>June 16, 2026</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)' }}>Vercel · Production · All three clouds</div>
          <div className="grad-sep" />
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Team</div>
          {[
            { name: 'Vishnu',    role: 'PM · Product · Design', color: '#a855f7' },
            { name: 'Anushman', role: 'Full-stack Engineer',    color: '#4f8eff' },
            { name: 'Anand',    role: 'QA · Validation',       color: '#10b981' },
          ].map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textAlign: 'left' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.color + '22', border: `1px solid ${t.color}44`, color: t.color, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.32)' }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────

const SLIDES = [
  { id: 'hero',     label: 'Intro' },
  { id: 'platform', label: 'Platform' },
  { id: 'arch',     label: 'Architecture' },
  { id: 'live',     label: 'Live' },
  { id: 'features', label: 'Features' },
  { id: 'security', label: 'Security' },
  { id: 'stack',    label: 'Stack' },
  { id: 'closing',  label: 'Go Live' },
];

export default function PresentationPage() {
  const [slide, setSlide]     = useState(0);
  const [liveData, setLive]   = useState(null);
  const navigate = useNavigate();
  const total = SLIDES.length;

  useEffect(() => {
    Promise.all([getFiles(), getHealth()])
      .then(([files, health]) => setLive({ files, health }))
      .catch(() => setLive({ files: [], health: null }));
  }, []);

  const next = useCallback(() => setSlide(s => Math.min(s + 1, total - 1)), [total]);
  const prev = useCallback(() => setSlide(s => Math.max(s - 1, 0)),         []);

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft')               { e.preventDefault(); prev(); }
      else if (e.key === 'Escape')                  navigate('/app/files');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev, navigate]);

  const slideContent = [
    <SlideHero />,
    <SlidePlatform />,
    <SlideArch />,
    <SlideLive liveData={liveData} />,
    <SlideFeatures />,
    <SlideSecurity />,
    <SlideStack />,
    <SlideClosing />,
  ];

  return (
    <div className="pres">
      {/* Rainbow accent bar */}
      <div className="pres-top-accent" />

      {/* Animated background */}
      <div className="pres-bg">
        <div className="pres-orb pres-orb-1" />
        <div className="pres-orb pres-orb-2" />
        <div className="pres-orb pres-orb-3" />
        <div className="pres-orb pres-orb-4" />
        <div className="pres-orb pres-orb-5" />
        <div className="pres-grid" />
      </div>

      {/* Top bar */}
      <div className="pres-top-bar">
        <div className="pres-brand">Multi-Cloud Storage · Complete</div>
        <div className="pres-top-right">
          <span className="pres-counter-label">{slide + 1} / {total}</span>
          <button className="pres-exit-btn" onClick={() => navigate('/app/files')}>✕ Exit</button>
        </div>
      </div>

      {/* Slide stage — key forces re-mount → triggers enter animation */}
      <div className="pres-stage">
        <div key={slide} className="pres-slide-wrap">
          {slideContent[slide]}
        </div>
      </div>

      {/* Nav arrows */}
      <button className="pres-nav-btn pres-prev" onClick={prev} disabled={slide === 0}>‹</button>
      <button className="pres-nav-btn pres-next" onClick={next} disabled={slide === total - 1}>›</button>

      {/* Progress dots */}
      <div className="pres-dots">
        {SLIDES.map((s, i) => (
          <button key={s.id} className={`pres-dot${i === slide ? ' on' : ''}`} onClick={() => setSlide(i)} title={s.label} />
        ))}
      </div>
    </div>
  );
}
