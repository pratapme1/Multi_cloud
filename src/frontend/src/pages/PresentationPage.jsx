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
  if (diff <= 0) return <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', letterSpacing: '-.02em' }}>LIVE 🚀</div>;
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
  const bokeh = [
    { top: '6%',  left: '3%',  size: 90,  color: '#ff6b6b', opacity: .18, blur: 35, dur: 5.0, delay: '0s'   },
    { top: '65%', left: '1%',  size: 55,  color: '#ffd93d', opacity: .20, blur: 22, dur: 4.5, delay: '.7s'  },
    { top: '12%', right: '4%', size: 75,  color: '#22d3ee', opacity: .17, blur: 28, dur: 5.5, delay: '1.2s' },
    { top: '58%', right: '2%', size: 100, color: '#c084fc', opacity: .14, blur: 40, dur: 6.0, delay: '.3s'  },
    { top: '40%', left: '-1%', size: 48,  color: '#34d399', opacity: .20, blur: 18, dur: 4.2, delay: '1.8s' },
    { top: '35%', right: '0%', size: 65,  color: '#fb923c', opacity: .16, blur: 25, dur: 5.2, delay: '1.0s' },
  ];
  return (
    <div style={{ textAlign: 'center', maxWidth: 780, margin: '0 auto', position: 'relative' }}>
      {bokeh.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', top: b.top, left: b.left, right: b.right,
          width: b.size, height: b.size, borderRadius: '50%',
          background: b.color, opacity: b.opacity, filter: `blur(${b.blur}px)`,
          animation: `${i % 2 === 0 ? 'floatBob' : 'floatBobAlt'} ${b.dur}s ease-in-out ${b.delay} infinite`,
          pointerEvents: 'none',
        }} />
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
      <div className="sa sa-5" style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
        {[['3', 'Cloud Providers'], ['1', 'Unified Interface'], ['∞', 'File Sync']].map(([n, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg,#4f8eff,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="sa sa-6" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Press → to begin</span>
        <span className="arrow-hint" style={{ fontSize: 18, color: 'rgba(255,255,255,.35)' }}>→</span>
      </div>
    </div>
  );
}

// ── Slide 2 — Problem / Solution ─────────────────────────────────────

function SlidePlatform() {
  const before = [
    { icon: '🗂', title: '3 Separate Consoles', desc: 'AWS Console, Azure Portal, GCP — all different' },
    { icon: '🔒', title: 'Vendor Lock-in',       desc: 'Moving files between clouds takes hours' },
    { icon: '🔑', title: 'No Unified Access',    desc: 'Different IAM policies and RBAC per provider' },
    { icon: '👁', title: 'No Single View',        desc: 'No combined list, health status, or audit trail' },
  ];
  const after = [
    { icon: '⚡', title: 'Single Dashboard',    desc: 'One React UI — all three providers at a glance' },
    { icon: '↔',  title: 'Smart Sync',           desc: 'One click to replicate any file across all clouds' },
    { icon: '🛡', title: 'Role-Based Access',    desc: 'Super Admin, Admin, Viewer — one JWT layer' },
    { icon: '💚', title: 'Live Health Monitor',  desc: 'Real-time latency and status, all providers' },
  ];
  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Why we built this</div></div>
      <div className="sa sa-2" style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h2 className="pt-h2" style={{ margin: 0 }}>One console.</h2>
        <h2 className="pt-h2" style={{ margin: 0 }}><span className="pt-grad">Three clouds.</span></h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'stretch' }}>
        {/* Before */}
        <div className="pg-card panel-before sa sa-3" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(239,68,68,.2)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#ef4444' }}>Before</span>
          </div>
          {before.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center', marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(239,68,68,.85)', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)', lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Center arrow */}
        <div className="sa sa-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 4px' }}>
          <div style={{ fontSize: 24, background: 'linear-gradient(135deg,#4f8eff,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900 }}>→</div>
        </div>

        {/* After */}
        <div className="pg-card panel-after sa sa-4" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(79,142,255,.25)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(79,142,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#4f8eff' }}>After</span>
          </div>
          {after.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center', marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6fa8ff', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)', lineHeight: 1.4 }}>{desc}</div>
              </div>
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
          <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 0 }}>How it all <span className="pt-grad">connects</span></h2></div>
        </div>
      </div>

      <div className="sa sa-3">
        <svg viewBox="0 0 780 285" width="100%" style={{ maxHeight: 285, display: 'block' }}>
          <defs>
            <path id="pBrowserApi" d="M390 62 L390 112" />
            <path id="pApiAws"     d="M350 170 Q195 205 162 248" />
            <path id="pApiAzure"   d="M390 170 L390 248" />
            <path id="pApiGcs"     d="M430 170 Q590 205 618 248" />
            <filter id="apiGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          <rect x="290" y="8" width="200" height="54" rx="12" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" />
          <text x="390" y="30" textAnchor="middle" fill="rgba(255,255,255,.9)" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Browser · React UI</text>
          <text x="390" y="49" textAnchor="middle" fill="rgba(255,255,255,.4)" fontSize="10" fontFamily="Inter,system-ui">Vite · Port 5173</text>

          <rect x="274" y="115" width="232" height="54" rx="12" fill="rgba(79,142,255,.15)" stroke="rgba(79,142,255,.6)" strokeWidth="2" filter="url(#apiGlow)" />
          <text x="390" y="137" textAnchor="middle" fill="#7eb8ff" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Node.js · Express API</text>
          <text x="390" y="155" textAnchor="middle" fill="rgba(79,142,255,.7)" fontSize="10" fontFamily="Inter,system-ui">REST · Bearer Auth · Vercel</text>

          <rect x="70"  y="248" width="185" height="36" rx="10" fill="rgba(255,153,0,.14)"  stroke="rgba(255,153,0,.5)"  strokeWidth="1.5" />
          <text x="163" y="266" textAnchor="middle" fill="#ffb347" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">AWS S3</text>
          <text x="163" y="280" textAnchor="middle" fill="rgba(255,153,0,.5)" fontSize="9" fontFamily="Inter,system-ui">S3Client · us-east-1</text>
          <rect x="297" y="248" width="185" height="36" rx="10" fill="rgba(79,159,245,.13)" stroke="rgba(79,159,245,.5)" strokeWidth="1.5" />
          <text x="390" y="266" textAnchor="middle" fill="#80b8f8" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Azure Blob</text>
          <text x="390" y="280" textAnchor="middle" fill="rgba(79,159,245,.5)" fontSize="9" fontFamily="Inter,system-ui">BlobServiceClient</text>
          <rect x="525" y="248" width="185" height="36" rx="10" fill="rgba(52,168,83,.13)"  stroke="rgba(52,168,83,.5)"  strokeWidth="1.5" />
          <text x="618" y="266" textAnchor="middle" fill="#5dd888" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">GCS</text>
          <text x="618" y="280" textAnchor="middle" fill="rgba(52,168,83,.5)" fontSize="9" fontFamily="Inter,system-ui">@google-cloud/storage</text>

          <line x1="390" y1="62" x2="390" y2="115" stroke="rgba(255,255,255,.2)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M350 169 Q195 205 162 248" fill="none" stroke="rgba(255,153,0,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="390" y1="169" x2="390" y2="248"                                     stroke="rgba(79,159,245,.35)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M430 169 Q590 205 618 248" fill="none" stroke="rgba(52,168,83,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />

          {[0, 1.4].map((d, i) => (
            <circle key={`b${i}`} r="4" fill="#4f8eff" opacity="0">
              <animateMotion dur="2.2s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pBrowserApi" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[0, 2.0].map((d, i) => (
            <circle key={`aws${i}`} r="3.5" fill="#ff9900" opacity="0">
              <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAws" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[0.5, 2.3].map((d, i) => (
            <circle key={`az${i}`} r="3.5" fill="#4f9ff5" opacity="0">
              <animateMotion dur="2.5s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAzure" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
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
          ['☁', 'Upload',  'Browser → Signed URL → Provider', '#ff9500'],
          ['↔', 'Sync',    'API → listFiles → copy → upload',  '#4f8eff'],
          ['🔐', 'Auth',   'Supabase JWT → Bearer token',      '#a855f7'],
        ].map(([icon, label, val, color]) => (
          <div key={label} className="pg-card" style={{ padding: '10px 14px', textAlign: 'center', borderColor: color + '35' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3, fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.55)' }}>{val}</div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div className="sa sa-1"><h2 className="pt-h2" style={{ margin: 0 }}>Live <span className="pt-grad">Platform</span></h2></div>
        <div className="sa sa-2"><span className="live-badge"><span className="live-badge-dot" />LIVE</span></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14 }}>

        {/* Big file count */}
        <div className="pg-card sa sa-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, borderColor: 'rgba(255,217,61,.25)', boxShadow: '0 8px 32px rgba(0,0,0,.4), 0 0 40px rgba(255,217,61,.06)' }}>
          <div style={{ fontSize: 10, color: 'rgba(255,217,61,.55)', textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 700 }}>Total Files</div>
          <div className="pres-num">{loading ? '—' : <CountUp to={totalFiles} />}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)' }}>across all providers</div>
          <div style={{ width: '80%', height: 1, background: 'rgba(255,217,61,.15)', margin: '4px 0' }} />
          <div style={{ fontSize: 11, color: loading ? 'rgba(255,255,255,.2)' : '#10b981', fontWeight: 700 }}>
            {loading ? '…' : `${Object.values(provCount).filter(v => v > 0).length} / 3 providers active`}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Provider health — big colored pills */}
          <div className="pg-card sa sa-4" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>Provider Health</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['aws', 'azure', 'gcs'].map(key => {
                const ph = healthMap[key];
                const ok = ph?.status === 'ok';
                const c  = PC[key];
                return (
                  <div key={key} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: loading ? 'rgba(255,255,255,.04)' : ok ? c + '15' : 'rgba(239,68,68,.1)', border: `1px solid ${loading ? 'rgba(255,255,255,.08)' : ok ? c + '45' : 'rgba(239,68,68,.3)'}`, textAlign: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? 'rgba(255,255,255,.2)' : ok ? c : '#ef4444', margin: '0 auto 6px', boxShadow: ok && !loading ? `0 0 8px ${c}` : 'none', animation: ok && !loading ? 'blinkDot 2.5s ease-in-out infinite' : 'none' }} />
                    <div style={{ fontSize: 12, fontWeight: 800, color: loading ? 'rgba(255,255,255,.2)' : ok ? c : '#ef4444' }}>{loading ? '…' : ok ? 'OK' : 'Error'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 2 }}>{PL[key]}</div>
                    {ph?.latencyMs != null && <div style={{ fontSize: 10, color: c, marginTop: 2, fontWeight: 700 }}>{ph.latencyMs}ms</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* File distribution bars — taller */}
          <div className="pg-card sa sa-5" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>File Distribution</div>
            {['aws', 'azure', 'gcs'].map(key => {
              const count = provCount[key];
              const pct   = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)' }}>{PL[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: loading ? 'rgba(255,255,255,.2)' : PC[key] }}>{loading ? '—' : count}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(255,255,255,.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div key={`${barKey}-${key}`} className="bar-anim"
                      style={{ height: '100%', borderRadius: 99, background: `linear-gradient(to right, ${PC[key]}, ${PC[key]}88)`, width: `${pct}%`, boxShadow: `0 0 8px ${PC[key]}60` }} />
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
    { icon: '☁',  color: '#4f8eff', bg: 'rgba(79,142,255,.15)',  title: 'Unified Upload',      desc: 'Upload once and replicate to all three clouds via direct signed URLs.' },
    { icon: '↔',  color: '#a855f7', bg: 'rgba(168,85,247,.15)',  title: 'Smart Sync',           desc: 'Sync any file from any source to any target — skips duplicates automatically.' },
    { icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,.15)',  title: 'Health Monitor',       desc: 'Real-time health checks across all providers with latency metrics.' },
    { icon: '🔐', color: '#10b981', bg: 'rgba(16,185,129,.15)',  title: 'Role-Based Access',    desc: 'Super Admin, Admin, Viewer. Supabase JWT with invite-link onboarding.' },
    { icon: '↓',  color: '#06b6d4', bg: 'rgba(6,182,212,.15)',   title: 'Per-Provider Download', desc: 'Stream files directly from the provider of your choice.' },
    { icon: '✕',  color: '#ef4444', bg: 'rgba(239,68,68,.15)',   title: 'Per-Provider Remove',  desc: 'Delete from one provider while keeping it safe on others.' },
    { icon: '📋', color: '#8b5cf6', bg: 'rgba(139,92,246,.15)',  title: 'Audit History',        desc: 'Per-file live action log — every sync, remove, and download tracked.' },
    { icon: '🔄', color: '#22d3ee', bg: 'rgba(34,211,238,.15)',  title: 'Auto Refresh',         desc: 'File list updates after every action. No manual refresh needed.' },
  ];

  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Feature set</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 16 }}>Everything you <span className="pt-grad">need</span></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map((c, i) => (
          <div key={c.title} className={`sa sa-${Math.min(i + 2, 6)}`}
            style={{ borderRadius: 16, border: `1px solid ${c.color}40`, overflow: 'hidden', background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', boxShadow: `0 8px 24px rgba(0,0,0,.35), inset 0 0 24px ${c.color}06`, transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 14px 32px rgba(0,0,0,.5), 0 0 20px ${c.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,.35), inset 0 0 24px ${c.color}06`; }}
          >
            {/* Colored top stripe */}
            <div style={{ height: 3, background: `linear-gradient(to right, ${c.color}, ${c.color}55)` }} />
            <div style={{ padding: '14px 14px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, border: `1px solid ${c.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10, boxShadow: `0 4px 14px ${c.color}25` }}>{c.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: c.color, marginBottom: 5 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Slide 6 — Security ───────────────────────────────────────────────

function SlideSecurity() {
  const roles = [
    { name: 'Super Admin', color: '#a855f7', perms: ['Upload', 'Download', 'Delete', 'Sync', 'Manage Roles', 'Invite Users'] },
    { name: 'Admin',       color: '#4f8eff', perms: ['Upload', 'Download', 'Delete', 'Sync', 'View Health'] },
    { name: 'Viewer',      color: '#10b981', perms: ['Download', 'View Health', 'View Files'] },
  ];
  const permColor = p => {
    if (['Delete', 'Manage Roles', 'Invite Users'].includes(p)) return { bg: 'rgba(239,68,68,.15)', color: '#f87171', border: 'rgba(239,68,68,.3)' };
    if (['Upload', 'Sync'].includes(p))                         return { bg: 'rgba(245,158,11,.15)', color: '#fbbf24', border: 'rgba(245,158,11,.3)' };
    return                                                             { bg: 'rgba(79,142,255,.12)', color: '#93bbff', border: 'rgba(79,142,255,.25)' };
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Security & access control</div></div>
        <div className="sa sa-2"><h2 className="pt-h2">Enterprise-grade<br /><span className="pt-grad">access model</span></h2></div>
        <div className="sa sa-3"><p className="pt-body" style={{ fontSize: 12.5, marginBottom: 16 }}>Three-tier role hierarchy with Supabase JWT. Invite-link onboarding — no open self-registration.</p></div>

        {roles.map((r, i) => (
          <div key={r.name} className={`sa sa-${i + 4}`} style={{ marginBottom: 10, background: `linear-gradient(135deg, ${r.color}18, rgba(255,255,255,.03))`, border: `1px solid ${r.color}40`, borderRadius: 12, padding: '12px 16px', boxShadow: `0 4px 20px ${r.color}12` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: r.color + '25', border: `1.5px solid ${r.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: r.color }}>{r.name}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.perms.map(p => {
                const s = permColor(p);
                return <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 700 }}>{p}</span>;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pg-card sa sa-2" style={{ marginTop: 48 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 16 }}>Auth Flow</div>
        {[
          ['Super Admin creates invite link',        '#a855f7'],
          ['User registers with invite token',       '#4f8eff'],
          ['Supabase issues JWT with role claim',    '#10b981'],
          ['Frontend stores token, sends as Bearer', '#f59e0b'],
          ['Backend verifies on every API request',  '#ef4444'],
        ].map(([text, color], i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 4 ? 0 : 0, alignItems: 'flex-start', paddingBottom: i < 4 ? 12 : 0, borderBottom: i < 4 ? '1px solid rgba(255,255,255,.06)' : 'none', marginTop: i > 0 ? 12 : 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: color + '25', border: `1.5px solid ${color}55`, color, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 8px ${color}30` }}>{i + 1}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', paddingTop: 4, lineHeight: 1.4 }}>{text}</div>
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
    { abbr: 'JS',  name: 'Node.js',    sub: 'Express · REST API',        color: '#68a063', cat: 'Backend'  },
    { abbr: '⚛',  name: 'React',      sub: 'Vite · Bootstrap 5',        color: '#61dafb', cat: 'Frontend' },
    { abbr: 'S3',  name: 'AWS SDK',    sub: 'v3 · S3Client · Presigner', color: '#ff9900', cat: 'Cloud'    },
    { abbr: 'AZ',  name: 'Azure SDK',  sub: '@azure/storage-blob',       color: '#4f9ff5', cat: 'Cloud'    },
    { abbr: 'GC',  name: 'GCS SDK',    sub: '@google-cloud/storage',     color: '#34c674', cat: 'Cloud'    },
    { abbr: 'SB',  name: 'Supabase',   sub: 'Auth · JWT · Postgres',     color: '#3ecf8e', cat: 'Auth'     },
    { abbr: '▲',  name: 'Vercel',      sub: 'Serverless · CI/CD · Edge', color: '#e2e8f0', cat: 'Deploy'   },
    { abbr: 'DB',  name: 'SQLite',     sub: 'better-sqlite3 · M3',       color: '#94a3b8', cat: 'Data'     },
  ];

  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Technology</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>Built on <span className="pt-grad">solid foundations</span></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11 }}>
        {items.map((item, i) => (
          <div key={item.name} className={`sa sa-${Math.min(i + 2, 6)}`}>
            <div style={{ borderRadius: 16, border: `1px solid ${item.color}30`, background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', overflow: 'hidden', transition: 'all .25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,.4), 0 0 20px ${item.color}18`; e.currentTarget.style.borderColor = item.color + '55'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = item.color + '30'; }}
            >
              <div style={{ padding: '16px 14px 14px', textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: `linear-gradient(135deg, ${item.color}28, ${item.color}10)`, border: `1.5px solid ${item.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: item.color, margin: '0 auto 10px', boxShadow: `0 4px 16px ${item.color}20` }}>{item.abbr}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.32)', lineHeight: 1.4, marginBottom: 10 }}>{item.sub}</div>
              </div>
              {/* Category tag strip at bottom */}
              <div style={{ padding: '5px 0', background: item.color + '14', borderTop: `1px solid ${item.color}25`, textAlign: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: item.color + 'cc' }}>{item.cat}</span>
              </div>
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
    { id: 'M2', label: 'Unified Interface', date: 'Jun 10', done: true, items: ['Cross-cloud sync', 'Redundant multi-provider upload', 'File management dashboard'] },
    { id: 'M3', label: 'Web UI + Deploy',   date: 'Jun 16', done: true, items: ['React UI · Auth · RBAC', 'Super Admin · Admin · Viewer roles', 'Deployed live on Vercel'] },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 28, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Milestone Summary</div></div>
        <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>All milestones <span className="pt-grad">complete</span> ✓</h2></div>

        {milestones.map((m, i) => (
          <div key={m.id} className={`sa sa-${i + 3}`} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div className="ms-done-circle"
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</div>
              {i < 2 && <div style={{ width: 2, height: 32, background: 'linear-gradient(to bottom,rgba(16,185,129,.5),rgba(16,185,129,.1))', marginTop: 4, borderRadius: 1 }} />}
            </div>
            <div style={{ flex: 1, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 4px 16px rgba(16,185,129,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>{m.id} · {m.label}</span>
                <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,.3)', fontWeight: 600 }}>{m.date}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: 'rgba(16,185,129,.2)', color: '#34d399', border: '1px solid rgba(16,185,129,.35)' }}>✓ DONE</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {m.items.map(it => (
                  <span key={it} style={{ fontSize: 10, color: 'rgba(52,211,153,.7)', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{it}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="pg-card sa sa-2" style={{ textAlign: 'center', marginTop: 48, borderColor: 'rgba(255,217,61,.2)', boxShadow: '0 8px 32px rgba(0,0,0,.4), 0 0 40px rgba(255,217,61,.05)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,217,61,.6)', marginBottom: 14 }}>Time to Go-Live</div>
          <Countdown target={GO_LIVE} />
          <div className="grad-sep" />
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 2 }}>June 16, 2026</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)' }}>Vercel · Production · All three clouds</div>
          <div className="grad-sep" />
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 12 }}>Team</div>
          {[
            { name: 'Vishnu',    role: 'PM · Product · Design', color: '#a855f7' },
            { name: 'Anushman', role: 'Full-stack Engineer',    color: '#4f8eff' },
            { name: 'Anand',    role: 'QA · Validation',       color: '#10b981' },
          ].map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, textAlign: 'left' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg,${t.color}30,${t.color}10)`, border: `1.5px solid ${t.color}55`, color: t.color, fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 10px ${t.color}25` }}>{t.name[0]}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{t.role}</div>
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

      {/* Slide stage */}
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
