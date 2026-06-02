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

// ── Slide 1 — Hero ───────────────────────────────────────────────────

function SlideHero() {
  const bokeh = [
    { top: '6%',  left: '3%',  size: 90,  color: '#ff6b6b', opacity: .12, blur: 40, dur: 5.0, delay: '0s'   },
    { top: '65%', left: '1%',  size: 55,  color: '#ffd93d', opacity: .15, blur: 25, dur: 4.5, delay: '.7s'  },
    { top: '12%', right: '4%', size: 75,  color: '#22d3ee', opacity: .12, blur: 30, dur: 5.5, delay: '1.2s' },
    { top: '58%', right: '2%', size: 100, color: '#a855f7', opacity: .1,  blur: 45, dur: 6.0, delay: '.3s'  },
    { top: '40%', left: '-1%', size: 48,  color: '#10b981', opacity: .14, blur: 20, dur: 4.2, delay: '1.8s' },
    { top: '35%', right: '0%', size: 65,  color: '#f59e0b', opacity: .12, blur: 28, dur: 5.2, delay: '1.0s' },
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
      <div className="sa sa-5" style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
        {[['3', 'Cloud Providers', '#6366f1'], ['1', 'Unified Interface', '#ec4899'], ['∞', 'File Sync', '#f59e0b']].map(([n, label, color]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{n}</div>
            <div style={{ fontSize: 10, color: 'rgba(15,23,42,.4)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="sa sa-6" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 26 }}>
        <span style={{ fontSize: 11, color: 'rgba(15,23,42,.28)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Press → to begin</span>
        <span className="arrow-hint" style={{ fontSize: 18, color: 'rgba(15,23,42,.35)' }}>→</span>
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
    { icon: '⚡', title: 'Single Dashboard',   desc: 'One React UI — all three providers at a glance' },
    { icon: '↔',  title: 'Smart Sync',          desc: 'One click to replicate any file across all clouds' },
    { icon: '🛡', title: 'Role-Based Access',   desc: 'Super Admin, Admin, Viewer — one JWT layer' },
    { icon: '💚', title: 'Live Health Monitor', desc: 'Real-time latency and status, all providers' },
  ];
  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Why we built this</div></div>
      <div className="sa sa-2" style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <h2 className="pt-h2" style={{ margin: 0 }}>One console.</h2>
        <h2 className="pt-h2" style={{ margin: 0 }}><span className="pt-grad">Three clouds.</span></h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'stretch' }}>
        <div className="pg-card panel-before sa sa-3" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(239,68,68,.18)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#dc2626' }}>Before</span>
          </div>
          {before.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center', marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'rgba(15,23,42,.45)', lineHeight: 1.4 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="sa sa-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
          <div style={{ fontSize: 22, background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900 }}>→</div>
        </div>
        <div className="pg-card panel-after sa sa-4" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(59,130,246,.2)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(59,130,246,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#2563eb' }}>After</span>
          </div>
          {after.map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: 'center', marginTop: 1 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 11, color: 'rgba(15,23,42,.45)', lineHeight: 1.4 }}>{desc}</div>
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

          <rect x="290" y="8" width="200" height="54" rx="12" fill="rgba(255,255,255,.9)" stroke="rgba(15,23,42,.15)" strokeWidth="1.5" />
          <text x="390" y="30" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Browser · React UI</text>
          <text x="390" y="49" textAnchor="middle" fill="rgba(15,23,42,.45)" fontSize="10" fontFamily="Inter,system-ui">Vite · Port 5173</text>

          <rect x="274" y="115" width="232" height="54" rx="12" fill="rgba(99,102,241,.12)" stroke="rgba(99,102,241,.5)" strokeWidth="2" filter="url(#apiGlow)" />
          <text x="390" y="137" textAnchor="middle" fill="#4338ca" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Node.js · Express API</text>
          <text x="390" y="155" textAnchor="middle" fill="rgba(99,102,241,.7)" fontSize="10" fontFamily="Inter,system-ui">REST · Bearer Auth · Vercel</text>

          <rect x="70"  y="248" width="185" height="36" rx="10" fill="rgba(255,153,0,.12)"  stroke="rgba(217,119,6,.45)"  strokeWidth="1.5" />
          <text x="163" y="266" textAnchor="middle" fill="#b45309" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">AWS S3</text>
          <text x="163" y="280" textAnchor="middle" fill="rgba(180,83,9,.55)" fontSize="9" fontFamily="Inter,system-ui">S3Client · us-east-1</text>
          <rect x="297" y="248" width="185" height="36" rx="10" fill="rgba(59,130,246,.1)"  stroke="rgba(37,99,235,.4)"  strokeWidth="1.5" />
          <text x="390" y="266" textAnchor="middle" fill="#1d4ed8" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">Azure Blob</text>
          <text x="390" y="280" textAnchor="middle" fill="rgba(29,78,216,.5)" fontSize="9" fontFamily="Inter,system-ui">BlobServiceClient</text>
          <rect x="525" y="248" width="185" height="36" rx="10" fill="rgba(34,197,94,.1)"   stroke="rgba(22,163,74,.4)"  strokeWidth="1.5" />
          <text x="618" y="266" textAnchor="middle" fill="#15803d" fontSize="11" fontWeight="700" fontFamily="Inter,system-ui">GCS</text>
          <text x="618" y="280" textAnchor="middle" fill="rgba(21,128,61,.5)" fontSize="9" fontFamily="Inter,system-ui">@google-cloud/storage</text>

          <line x1="390" y1="62" x2="390" y2="115" stroke="rgba(15,23,42,.15)" strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M350 169 Q195 205 162 248" fill="none" stroke="rgba(217,119,6,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="390" y1="169" x2="390" y2="248"                                     stroke="rgba(37,99,235,.3)"  strokeWidth="1.5" strokeDasharray="4 3" />
          <path d="M430 169 Q590 205 618 248" fill="none" stroke="rgba(22,163,74,.35)"  strokeWidth="1.5" strokeDasharray="4 3" />

          {[0, 1.4].map((d, i) => (
            <circle key={`b${i}`} r="4" fill="#6366f1" opacity="0">
              <animateMotion dur="2.2s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pBrowserApi" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.2s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[0, 2.0].map((d, i) => (
            <circle key={`aws${i}`} r="3.5" fill="#f59e0b" opacity="0">
              <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAws" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[0.5, 2.3].map((d, i) => (
            <circle key={`az${i}`} r="3.5" fill="#3b82f6" opacity="0">
              <animateMotion dur="2.5s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiAzure" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.5s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {[1.0, 2.7].map((d, i) => (
            <circle key={`gcs${i}`} r="3.5" fill="#22c55e" opacity="0">
              <animateMotion dur="2.8s" begin={`${d}s`} repeatCount="indefinite"><mpath href="#pApiGcs" /></animateMotion>
              <animate attributeName="opacity" values="0;1;1;0" dur="2.8s" begin={`${d}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>
      <div className="sa sa-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
        {[
          ['☁', 'Upload',  'Browser → Signed URL → Provider', '#f59e0b'],
          ['↔', 'Sync',    'API → listFiles → copy → upload',  '#6366f1'],
          ['🔐', 'Auth',   'Supabase JWT → Bearer token',      '#a855f7'],
        ].map(([icon, label, val, color]) => (
          <div key={label} className="pg-card" style={{ padding: '10px 14px', textAlign: 'center', borderColor: color + '35' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 10, color, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3, fontWeight: 700 }}>{label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(15,23,42,.5)' }}>{val}</div>
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
  const PC = { aws: '#f59e0b', azure: '#3b82f6', gcs: '#22c55e' };
  const barKey = loading ? 'loading' : 'loaded';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <div className="sa sa-1"><h2 className="pt-h2" style={{ margin: 0 }}>Live <span className="pt-grad">Platform</span></h2></div>
        <div className="sa sa-2"><span className="live-badge"><span className="live-badge-dot" />LIVE</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14 }}>
        <div className="pg-card sa sa-3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, borderColor: 'rgba(99,102,241,.2)', boxShadow: '0 4px 24px rgba(99,102,241,.08)' }}>
          <div style={{ fontSize: 10, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 700 }}>Total Files</div>
          <div className="pres-num">{loading ? '—' : <CountUp to={totalFiles} />}</div>
          <div style={{ fontSize: 11, color: 'rgba(15,23,42,.4)' }}>across all providers</div>
          <div style={{ width: '80%', height: 1, background: 'rgba(99,102,241,.15)', margin: '4px 0' }} />
          <div style={{ fontSize: 11, color: loading ? 'rgba(15,23,42,.2)' : '#16a34a', fontWeight: 700 }}>
            {loading ? '…' : `${Object.values(provCount).filter(v => v > 0).length} / 3 providers active`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="pg-card sa sa-4" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,23,42,.35)', marginBottom: 12 }}>Provider Health</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['aws', 'azure', 'gcs'].map(key => {
                const ph = healthMap[key];
                const ok = ph?.status === 'ok';
                const c  = PC[key];
                return (
                  <div key={key} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: loading ? 'rgba(15,23,42,.03)' : ok ? c + '12' : 'rgba(239,68,68,.07)', border: `1px solid ${loading ? 'rgba(15,23,42,.07)' : ok ? c + '40' : 'rgba(239,68,68,.2)'}`, textAlign: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? 'rgba(15,23,42,.15)' : ok ? c : '#ef4444', margin: '0 auto 6px', boxShadow: ok && !loading ? `0 0 8px ${c}80` : 'none', animation: ok && !loading ? 'blinkDot 2.5s ease-in-out infinite' : 'none' }} />
                    <div style={{ fontSize: 12, fontWeight: 800, color: loading ? 'rgba(15,23,42,.25)' : ok ? c : '#dc2626' }}>{loading ? '…' : ok ? 'OK' : 'Error'}</div>
                    <div style={{ fontSize: 10, color: 'rgba(15,23,42,.4)', marginTop: 2 }}>{PL[key]}</div>
                    {ph?.latencyMs != null && <div style={{ fontSize: 10, color: c, marginTop: 2, fontWeight: 700 }}>{ph.latencyMs}ms</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pg-card sa sa-5" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,23,42,.35)', marginBottom: 12 }}>File Distribution</div>
            {['aws', 'azure', 'gcs'].map(key => {
              const count = provCount[key];
              const pct   = totalFiles > 0 ? (count / totalFiles) * 100 : 0;
              return (
                <div key={key} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(15,23,42,.6)' }}>{PL[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: loading ? 'rgba(15,23,42,.2)' : PC[key] }}>{loading ? '—' : count}</span>
                  </div>
                  <div style={{ height: 8, background: 'rgba(15,23,42,.07)', borderRadius: 99, overflow: 'hidden' }}>
                    <div key={`${barKey}-${key}`} className="bar-anim"
                      style={{ height: '100%', borderRadius: 99, background: `linear-gradient(to right, ${PC[key]}, ${PC[key]}88)`, width: `${pct}%`, boxShadow: `0 0 6px ${PC[key]}50` }} />
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
    { icon: '☁',  color: '#6366f1', bg: 'rgba(99,102,241,.1)',  title: 'Unified Upload',       desc: 'Upload once, replicate to all three clouds via direct signed URLs.' },
    { icon: '↔',  color: '#a855f7', bg: 'rgba(168,85,247,.1)',  title: 'Smart Sync',            desc: 'Sync any file from any source to any target — skips duplicates.' },
    { icon: '⚡', color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  title: 'Health Monitor',        desc: 'Real-time health checks across all providers with latency.' },
    { icon: '🔐', color: '#10b981', bg: 'rgba(16,185,129,.1)',  title: 'Role-Based Access',     desc: 'Super Admin, Admin, Viewer. Supabase JWT with invite-link flow.' },
    { icon: '↓',  color: '#0ea5e9', bg: 'rgba(14,165,233,.1)',  title: 'Per-Provider Download', desc: 'Stream files directly from the provider of your choice.' },
    { icon: '✕',  color: '#ef4444', bg: 'rgba(239,68,68,.1)',   title: 'Per-Provider Remove',   desc: 'Delete from one provider while keeping it safe on others.' },
    { icon: '📋', color: '#8b5cf6', bg: 'rgba(139,92,246,.1)',  title: 'Audit History',         desc: 'Per-file live action log — every sync, remove, and download tracked.' },
    { icon: '🔄', color: '#06b6d4', bg: 'rgba(6,182,212,.1)',   title: 'Auto Refresh',          desc: 'File list updates after every action. No manual refresh needed.' },
  ];
  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Feature set</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 16 }}>Everything you <span className="pt-grad">need</span></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {cards.map((c, i) => (
          <div key={c.title} className={`sa sa-${Math.min(i + 2, 6)}`}
            style={{ borderRadius: 16, border: `1px solid ${c.color}30`, overflow: 'hidden', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', boxShadow: `0 4px 20px rgba(0,0,0,.06)`, transition: 'transform .2s, box-shadow .2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,.1), 0 0 0 1px ${c.color}35`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.06)'; }}
          >
            <div style={{ height: 3, background: `linear-gradient(to right, ${c.color}, ${c.color}55)` }} />
            <div style={{ padding: '14px 14px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, border: `1px solid ${c.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: c.color, marginBottom: 5 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(15,23,42,.45)', lineHeight: 1.5 }}>{c.desc}</div>
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
    { name: 'Super Admin', color: '#7c3aed', perms: ['Upload', 'Download', 'Delete', 'Sync', 'Manage Roles', 'Invite Users'] },
    { name: 'Admin',       color: '#2563eb', perms: ['Upload', 'Download', 'Delete', 'Sync', 'View Health'] },
    { name: 'Viewer',      color: '#059669', perms: ['Download', 'View Health', 'View Files'] },
  ];
  const permColor = p => {
    if (['Delete', 'Manage Roles', 'Invite Users'].includes(p)) return { bg: 'rgba(239,68,68,.1)', color: '#dc2626', border: 'rgba(239,68,68,.2)' };
    if (['Upload', 'Sync'].includes(p))                         return { bg: 'rgba(245,158,11,.1)', color: '#d97706', border: 'rgba(245,158,11,.2)' };
    return                                                             { bg: 'rgba(37,99,235,.08)', color: '#2563eb', border: 'rgba(37,99,235,.18)' };
  };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Security & access control</div></div>
        <div className="sa sa-2"><h2 className="pt-h2">Enterprise-grade<br /><span className="pt-grad">access model</span></h2></div>
        <div className="sa sa-3"><p className="pt-body" style={{ fontSize: 12.5, marginBottom: 16 }}>Three-tier role hierarchy with Supabase JWT. Invite-link onboarding — no open self-registration.</p></div>
        {roles.map((r, i) => (
          <div key={r.name} className={`sa sa-${i + 4}`} style={{ marginBottom: 10, background: `linear-gradient(135deg, ${r.color}10, rgba(255,255,255,.6))`, border: `1px solid ${r.color}25`, borderRadius: 12, padding: '12px 16px', boxShadow: `0 2px 16px ${r.color}08` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: r.color + '18', border: `1.5px solid ${r.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: r.color }} />
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
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(15,23,42,.35)', marginBottom: 16 }}>Auth Flow</div>
        {[
          ['Super Admin creates invite link',        '#7c3aed'],
          ['User registers with invite token',       '#2563eb'],
          ['Supabase issues JWT with role claim',    '#059669'],
          ['Frontend stores token, sends as Bearer', '#d97706'],
          ['Backend verifies on every API request',  '#dc2626'],
        ].map(([text, color], i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingBottom: i < 4 ? 12 : 0, borderBottom: i < 4 ? '1px solid rgba(15,23,42,.06)' : 'none', marginTop: i > 0 ? 12 : 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: color + '18', border: `1.5px solid ${color}45`, color, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: 12, color: 'rgba(15,23,42,.55)', paddingTop: 4, lineHeight: 1.4 }}>{text}</div>
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
    { abbr: 'JS',  name: 'Node.js',   sub: 'Express · REST API',        color: '#16a34a', cat: 'Backend'  },
    { abbr: '⚛',  name: 'React',     sub: 'Vite · Bootstrap 5',        color: '#0284c7', cat: 'Frontend' },
    { abbr: 'S3',  name: 'AWS SDK',   sub: 'v3 · S3Client · Presigner', color: '#d97706', cat: 'Cloud'    },
    { abbr: 'AZ',  name: 'Azure SDK', sub: '@azure/storage-blob',       color: '#2563eb', cat: 'Cloud'    },
    { abbr: 'GC',  name: 'GCS SDK',   sub: '@google-cloud/storage',     color: '#15803d', cat: 'Cloud'    },
    { abbr: 'SB',  name: 'Supabase',  sub: 'Auth · JWT · Postgres',     color: '#059669', cat: 'Auth'     },
    { abbr: '▲',  name: 'Vercel',     sub: 'Serverless · CI/CD · Edge', color: '#475569', cat: 'Deploy'   },
    { abbr: 'DB',  name: 'SQLite',    sub: 'better-sqlite3 · M3',       color: '#7c3aed', cat: 'Data'     },
  ];
  return (
    <div>
      <div className="sa sa-1"><div className="pt-label">Technology</div></div>
      <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>Built on <span className="pt-grad">solid foundations</span></h2></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11 }}>
        {items.map((item, i) => (
          <div key={item.name} className={`sa sa-${Math.min(i + 2, 6)}`}>
            <div style={{ borderRadius: 16, border: `1px solid ${item.color}25`, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(20px)', overflow: 'hidden', transition: 'all .25s', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,.1), 0 0 0 1px ${item.color}35`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.05)'; }}
            >
              <div style={{ padding: '16px 14px 12px', textAlign: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`, border: `1.5px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: item.color, margin: '0 auto 10px' }}>{item.abbr}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3 }}>{item.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(15,23,42,.4)', lineHeight: 1.4, marginBottom: 10 }}>{item.sub}</div>
              </div>
              <div style={{ padding: '5px 0', background: item.color + '10', borderTop: `1px solid ${item.color}20`, textAlign: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: item.color }}>{item.cat}</span>
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
  const milestones = [
    { id: 'M1', label: 'API Modules',       date: 'Jun 5',  items: ['AWS S3 · Azure Blob · GCS', 'List · Upload · Download · Delete', 'Health checks · Signed URLs'] },
    { id: 'M2', label: 'Unified Interface', date: 'Jun 10', items: ['Cross-cloud sync', 'Redundant multi-provider upload', 'File management dashboard'] },
    { id: 'M3', label: 'Web UI + Deploy',   date: 'Jun 16', items: ['React UI · Auth · RBAC', 'Super Admin · Admin · Viewer roles', 'Deployed live on Vercel'] },
  ];
  const achievements = [
    { n: '3',  label: 'Cloud Providers', color: '#6366f1' },
    { n: '8',  label: 'Core Features',   color: '#ec4899' },
    { n: '3',  label: 'Role Tiers',      color: '#f59e0b' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>
      <div>
        <div className="sa sa-1"><div className="pt-label">Milestone Summary</div></div>
        <div className="sa sa-2"><h2 className="pt-h2" style={{ marginBottom: 20 }}>All milestones <span className="pt-grad">complete</span> ✓</h2></div>
        {milestones.map((m, i) => (
          <div key={m.id} className={`sa sa-${i + 3}`} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div className="ms-done-circle"
                style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>✓</div>
              {i < 2 && <div style={{ width: 2, height: 32, background: 'linear-gradient(to bottom,rgba(16,185,129,.4),rgba(16,185,129,.1))', marginTop: 4, borderRadius: 1 }} />}
            </div>
            <div style={{ flex: 1, background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#059669' }}>{m.id} · {m.label}</span>
                <span style={{ fontSize: 9.5, color: 'rgba(15,23,42,.35)', fontWeight: 600 }}>{m.date}</span>
                <span style={{ fontSize: 9.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: 'rgba(16,185,129,.15)', color: '#059669', border: '1px solid rgba(16,185,129,.25)' }}>✓ DONE</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {m.items.map(it => (
                  <span key={it} style={{ fontSize: 10, color: '#059669', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.18)', borderRadius: 6, padding: '2px 8px', fontWeight: 600 }}>{it}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Achievement card */}
        <div className="pg-card sa sa-2" style={{ textAlign: 'center', borderColor: 'rgba(99,102,241,.2)', boxShadow: '0 4px 24px rgba(99,102,241,.08)' }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>Project Complete</div>
          <div style={{ fontSize: 11, color: 'rgba(15,23,42,.4)', marginBottom: 16 }}>June 16, 2026 · Vercel Production</div>
          <div className="grad-sep" style={{ margin: '12px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
            {achievements.map(a => (
              <div key={a.label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: a.color + '09', border: `1px solid ${a.color}22` }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: a.color, lineHeight: 1 }}>{a.n}</div>
                <div style={{ fontSize: 9, color: 'rgba(15,23,42,.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 3 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team card */}
        <div className="pg-card sa sa-3">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(15,23,42,.3)', marginBottom: 12 }}>Team</div>
          {[
            { name: 'Vishnu',    role: 'PM · Product · Design', color: '#7c3aed' },
            { name: 'Anushman', role: 'Full-stack Engineer',    color: '#2563eb' },
            { name: 'Anand',    role: 'QA · Validation',       color: '#059669' },
          ].map(t => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${t.color}22,${t.color}08)`, border: `1.5px solid ${t.color}45`, color: t.color, fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.name[0]}</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(15,23,42,.4)' }}>{t.role}</div>
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
  const [slide, setSlide]   = useState(0);
  const [liveData, setLive] = useState(null);
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
      <div className="pres-top-accent" />
      <div className="pres-bg">
        <div className="pres-orb pres-orb-1" />
        <div className="pres-orb pres-orb-2" />
        <div className="pres-orb pres-orb-3" />
        <div className="pres-orb pres-orb-4" />
        <div className="pres-orb pres-orb-5" />
        <div className="pres-grid" />
      </div>
      <div className="pres-top-bar">
        <div className="pres-brand">Multi-Cloud Storage · Complete</div>
        <div className="pres-top-right">
          <span className="pres-counter-label">{slide + 1} / {total}</span>
          <button className="pres-exit-btn" onClick={() => navigate('/app/files')}>✕ Exit</button>
        </div>
      </div>
      <div className="pres-stage">
        <div key={slide} className="pres-slide-wrap">
          {slideContent[slide]}
        </div>
      </div>
      <button className="pres-nav-btn pres-prev" onClick={prev} disabled={slide === 0}>‹</button>
      <button className="pres-nav-btn pres-next" onClick={next} disabled={slide === total - 1}>›</button>
      <div className="pres-dots">
        {SLIDES.map((s, i) => (
          <button key={s.id} className={`pres-dot${i === slide ? ' on' : ''}`} onClick={() => setSlide(i)} title={s.label} />
        ))}
      </div>
    </div>
  );
}
