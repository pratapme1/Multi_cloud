import { useState, useCallback, useEffect } from 'react';
import { runSync, syncFile, deleteFile, downloadFile, getHealth } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FileTypeIcon, ProviderIcons, PL } from './FileIcons.jsx';

const PC = { aws: 'pb-aws', azure: 'pb-az', gcs: 'pb-gcs' };

export default function Drawer({ mode, file, onClose, onSimulateDeg, onRefresh }) {
  return (
    <div className="drawer">
      {mode === 'file' && file && <FileDetail file={file} onClose={onClose} onRefresh={onRefresh} />}
      {mode === 'sync'          && <SyncPanel file={file} onClose={onClose} onRefresh={onRefresh} />}
      {(mode === 'health' || mode === 'health-deg') && (
        <HealthPanel degraded={mode === 'health-deg'} onClose={onClose} onSimulateDeg={onSimulateDeg} />
      )}
    </div>
  );
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function FileDetail({ file, onClose, onRefresh }) {
  const toast = useToast();
  const { can } = useAuth();
  const [syncing, setSyncing]         = useState(null);
  const [confirm, setConfirm]         = useState(null);
  const [removing, setRemoving]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab]                 = useState('storage');
  const [sessionLog, setSessionLog]   = useState([]);

  const ALL_PROVIDERS = ['aws', 'azure', 'gcs'];
  const dotColor = p => p === 'aws' ? 'var(--aws)' : p === 'azure' ? 'var(--azure)' : 'var(--gcs)';
  const busy = syncing !== null || removing !== null;

  const logEvent = (icon, text, variant = 'default') => {
    setSessionLog(prev => [{ id: Date.now(), icon, text, time: nowTime(), variant }, ...prev]);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(file.name, file.providers[0]);
      logEvent('↓', `Downloaded via ${PL[file.providers[0]]}`, 'ok');
    } catch (err) {
      toast(err.message ?? 'Download failed', 'err');
    } finally {
      setDownloading(false);
    }
  };

  const handleSyncTo = async targetProvider => {
    const source = file.providers[0];
    setSyncing(targetProvider);
    try {
      const r = await syncFile(file.name, source, [targetProvider]);
      if (r.copied > 0) {
        toast(`Synced to ${PL[targetProvider]}`, 'ok', `${file.name} is now on ${PL[targetProvider]}`);
        logEvent('↗', `Synced to ${PL[targetProvider]} from ${PL[source]}`, 'ok');
        onRefresh?.();
      } else if (r.skipped > 0) {
        toast(`Already on ${PL[targetProvider]}`, 'inf');
        logEvent('↗', `Sync skipped — already on ${PL[targetProvider]}`, 'skip');
        onRefresh?.();
      } else {
        toast('Sync failed', 'err');
        logEvent('✕', `Sync to ${PL[targetProvider]} failed`, 'err');
      }
    } catch {
      toast('Sync failed', 'err');
      logEvent('✕', `Sync to ${PL[targetProvider]} failed`, 'err');
    } finally {
      setSyncing(null);
    }
  };

  const handleRemove = async targetProvider => {
    setConfirm(null);
    setRemoving(targetProvider);
    try {
      await deleteFile(file.name, [targetProvider]);
      toast(`Removed from ${PL[targetProvider]}`, 'ok');
      logEvent('✕', `Removed from ${PL[targetProvider]}`, 'err');
      if (file.providers.length === 1) onClose();
      onRefresh?.();
    } catch (err) {
      toast(err.message ?? 'Remove failed', 'err');
    } finally {
      setRemoving(null);
    }
  };

  const handleDeleteAll = async () => {
    setConfirm(null);
    setRemoving('all');
    try {
      await deleteFile(file.name, file.providers);
      toast(`Deleted from all providers`, 'ok', file.name);
      onClose();
      onRefresh?.();
    } catch (err) {
      toast(err.message ?? 'Delete failed', 'err');
    } finally {
      setRemoving(null);
    }
  };

  const provBg  = p => p === 'aws' ? 'rgba(255,153,0,.08)' : p === 'azure' ? 'rgba(0,120,212,.08)' : 'rgba(52,168,83,.08)';
  const provBdr = p => p === 'aws' ? 'rgba(255,153,0,.25)' : p === 'azure' ? 'rgba(0,120,212,.25)' : 'rgba(52,168,83,.25)';

  const logIconColor = v => v === 'ok' ? 'var(--ok)' : v === 'err' ? 'var(--er)' : v === 'skip' ? 'var(--tx3)' : 'var(--tx2)';

  return (
    <>
      <div className="dw-head">
        <h3>File Details</h3>
        <button className="icb" onClick={onClose} title="Close">✕</button>
      </div>
      <div className="dw-body">

        {/* ── Hero ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 16px' }}>
          <FileTypeIcon type={file.type} size={50} />
          <div className="drawer-file-name" title={file.name} style={{ marginTop: 10, marginBottom: 3 }}>{file.name}</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 10 }}>{file.size} · {file.modified}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
            {file.providers.map(p => (
              <span key={p} style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: provBg(p), color: dotColor(p), border: `1px solid ${provBdr(p)}` }}>
                {PL[p]}
              </span>
            ))}
          </div>
        </div>

        {/* ── Meta ── */}
        <div className="kv" style={{ marginBottom: 14 }}>
          <div><label>Uploaded by</label><b>{file.uploadedBy ?? file.owner ?? 'Unknown'}</b></div>
          <div><label>Copies</label><b>{file.providers.length} of 3 providers</b></div>
          <div><label>Access</label><b>Role controlled</b></div>
        </div>

        {/* ── Download ── */}
        <button className="btn btn-p btn-full" disabled={downloading || busy} onClick={handleDownload}>
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none" style={{ marginRight: 6, flexShrink: 0 }}>
            <path d="M7 1v8M4 7l3 3 3-3M1 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {downloading ? 'Downloading…' : `Download · via ${PL[file.providers[0]]}`}
        </button>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginTop: 14, marginBottom: 2, borderBottom: '1px solid var(--bd)', paddingBottom: 0 }}>
          {[
            { key: 'storage', label: 'Storage', badge: `${file.providers.length} of 3` },
            { key: 'history', label: 'History',  badge: sessionLog.length > 0 ? String(sessionLog.length) : null },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 10px',
                fontSize: 12.5,
                fontWeight: tab === t.key ? 700 : 500,
                color: tab === t.key ? 'var(--tx)' : 'var(--tx3)',
                cursor: 'pointer',
                borderBottom: tab === t.key ? '2px solid var(--ac)' : '2px solid transparent',
                marginBottom: -1,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {t.label}
              {t.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: tab === t.key ? 'var(--ac)' : 'var(--sur2)', color: tab === t.key ? '#fff' : 'var(--tx3)' }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Storage tab ── */}
        {tab === 'storage' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: file.providers.length === 3 ? 'var(--ok)' : 'var(--tx3)' }}>
                {file.providers.length === 3 ? '✓ Fully redundant' : `${file.providers.length} of 3 providers`}
              </span>
            </div>

            {ALL_PROVIDERS.map(p => {
              const on           = file.providers.includes(p);
              const isConfirming = confirm === p;
              const isSyncing    = syncing === p;
              const isRemoving   = removing === p;

              return (
                <div key={p} style={{ borderRadius: 10, border: `1px solid ${on ? provBdr(p) : 'var(--bd)'}`, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: on ? provBg(p) : 'var(--sur2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: on ? dotColor(p) : 'var(--bd)', flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: on ? 'var(--tx)' : 'var(--tx3)' }}>{PL[p]}</span>

                    {on ? (
                      <>
                        <span style={{ fontSize: 11, fontWeight: 700, color: dotColor(p) }}>✓ Stored</span>
                        {!isConfirming && can('delete') && (
                          <button className="btn btn-s btn-sm"
                            style={{ fontSize: 11, padding: '2px 9px', marginLeft: 6, color: 'var(--er)', borderColor: 'var(--erd)', background: 'var(--sur)' }}
                            disabled={busy} onClick={() => setConfirm(p)}>
                            {isRemoving ? '↻' : 'Remove'}
                          </button>
                        )}
                      </>
                    ) : (
                      can('sync') && (
                        <button className="btn btn-s btn-sm"
                          style={{ fontSize: 11, padding: '2px 10px' }}
                          disabled={busy} onClick={() => handleSyncTo(p)}>
                          {isSyncing ? '↻ Syncing…' : '↗ Sync here'}
                        </button>
                      )
                    )}
                  </div>

                  {isConfirming && (
                    <div style={{ padding: '12px 13px', background: 'var(--erb)', borderTop: `1px solid var(--erd)` }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--er)', marginBottom: 4 }}>
                        {file.providers.length === 1
                          ? '⚠ Last copy — permanently deletes this file'
                          : `Remove from ${PL[p]}?`}
                      </div>
                      {file.providers.length > 1 && (
                        <div style={{ fontSize: 11.5, color: 'var(--tx2)', marginBottom: 10 }}>
                          File stays on {file.providers.filter(x => x !== p).map(x => PL[x]).join(' and ')}.
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-s btn-sm" style={{ fontSize: 12 }} onClick={() => setConfirm(null)}>Cancel</button>
                        <button className="btn btn-sm"
                          style={{ fontSize: 12, flex: 1, background: 'var(--er)', color: '#fff', border: 'none' }}
                          disabled={isRemoving} onClick={() => handleRemove(p)}>
                          {isRemoving ? '↻ Removing…' : `Remove from ${PL[p]}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {can('delete') && (
              <>
                <div className="sep" />
                {confirm === 'all' ? (
                  <div style={{ padding: '13px', borderRadius: 10, background: 'var(--erb)', border: '1px solid var(--erd)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--er)', marginBottom: 4 }}>
                      ⚠ Delete from all {file.providers.length} provider{file.providers.length > 1 ? 's' : ''}?
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 10 }}>
                      Permanently deletes the file everywhere. Cannot be undone.
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-s btn-sm" style={{ fontSize: 12 }} onClick={() => setConfirm(null)}>Cancel</button>
                      <button className="btn btn-sm"
                        style={{ fontSize: 12, flex: 1, background: 'var(--er)', color: '#fff', border: 'none' }}
                        disabled={removing === 'all'} onClick={handleDeleteAll}>
                        {removing === 'all' ? '↻ Deleting…' : 'Yes, delete everywhere'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-s btn-full"
                    style={{ fontSize: 12, color: 'var(--er)', borderColor: 'var(--erd)' }}
                    disabled={busy} onClick={() => setConfirm('all')}>
                    <svg viewBox="0 0 14 14" width="11" height="11" fill="none" style={{ marginRight: 5, flexShrink: 0 }}>
                      <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
                        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Delete from all providers
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* ── History tab ── */}
        {tab === 'history' && (
          <div style={{ marginTop: 12 }}>
            {sessionLog.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--tx3)', fontSize: 12.5 }}>
                No actions yet this session.<br />
                <span style={{ fontSize: 11.5 }}>Sync, remove, or download a file to see events here.</span>
              </div>
            )}

            <div className="tl">
              {sessionLog.map(ev => (
                <div key={ev.id} className="tev" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: logIconColor(ev.variant), flexShrink: 0, width: 14, textAlign: 'center', marginTop: 1 }}>{ev.icon}</span>
                  <span style={{ flex: 1 }}>{ev.text}<small>{ev.time}</small></span>
                </div>
              ))}

              {/* Anchor: original upload event */}
              <div className="tev" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, opacity: 0.65 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx3)', flexShrink: 0, width: 14, textAlign: 'center', marginTop: 1 }}>↑</span>
                <span style={{ flex: 1 }}>
                  Uploaded by {file.uploadedBy ?? file.owner ?? 'Unknown'} to {file.providers.map(p => PL[p]).join(', ')}
                  <small>{file.modified}</small>
                </span>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--tx3)', textAlign: 'center' }}>
              History resets when the drawer is closed · Persistent log coming in M3
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SyncPanel({ onClose, onRefresh }) {
  const toast = useToast();
  const [from, setFrom] = useState('aws');
  const [targets, setTargets] = useState(['azure']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const PROVIDERS = [
    { key: 'aws',   label: 'AWS S3',      color: 'var(--aws)' },
    { key: 'azure', label: 'Azure Blob',  color: 'var(--azure)' },
    { key: 'gcs',   label: 'GCS',         color: 'var(--gcs)' },
  ];

  const toggleTarget = key => {
    setTargets(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const validTargets = targets.filter(t => t !== from);
  const canSync = validTargets.length > 0;

  const handleSync = async () => {
    setLoading(true);
    try {
      const r = await runSync(from, validTargets);
      setResult(r);
      const dest = validTargets.map(t => PL[t]).join(', ');
      toast(`${r.copied} copied, ${r.skipped} skipped`, 'ok', `Sync complete → ${dest}`);
      onRefresh?.();
    } catch {
      toast('Sync failed', 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="dw-head">
        <h3>Sync</h3>
        <button className="icb" onClick={onClose}>✕</button>
      </div>
      <div className="dw-body">
        <p style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 16 }}>
          Copy files to one or more destinations. Files already present are skipped.
        </p>

        <label className="fl">Source</label>
        <select className="sel" value={from} onChange={e => setFrom(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
          <option value="aws">AWS S3</option>
          <option value="azure">Azure Blob</option>
          <option value="gcs">GCS</option>
        </select>

        <label className="fl">Destinations</label>
        {PROVIDERS.filter(p => p.key !== from).map(p => {
          const checked = targets.includes(p.key);
          return (
            <div
              key={p.key}
              className={`tgchk${checked ? ' checked' : ''}`}
              onClick={() => toggleTarget(p.key)}
              title={p.label}
            >
              <div className="tgchk-box">{checked && '✓'}</div>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span>{p.label}</span>
            </div>
          );
        })}

        <button
          className="btn btn-p btn-full"
          style={{ marginTop: 16 }}
          onClick={handleSync}
          disabled={loading || !canSync}
        >
          {loading ? '↻ Syncing…' : `▶ Sync to ${validTargets.length || 0} destination${validTargets.length !== 1 ? 's' : ''}`}
        </button>

        {!canSync && (
          <div style={{ fontSize: 12, color: 'var(--tx3)', textAlign: 'center', marginTop: 8 }}>
            Select at least one destination
          </div>
        )}

        {result && (
          <>
            <div className="sep" />
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Last result</div>
            <div className="alert a-ok">
              ✓ {PL[result.from]} → {result.targets.map(t => PL[t]).join(', ')} · {result.copied} copied, {result.skipped} skipped
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center', background: 'var(--sur2)', border: '1px solid var(--bd)', borderRadius: 10, padding: 12 }}>
              <div><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ok)' }}>{result.copied}</div><div style={{ fontSize: 11, color: 'var(--tx3)' }}>Copied</div></div>
              <div><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--tx2)' }}>{result.skipped}</div><div style={{ fontSize: 11, color: 'var(--tx3)' }}>Skipped</div></div>
              <div><div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--er)' }}>{result.failed}</div><div style={{ fontSize: 11, color: 'var(--tx3)' }}>Failed</div></div>
            </div>
          </>
        )}

        <div className="sep" />
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>API — POST /api/sync</div>
        <div className="codeb">{JSON.stringify({ from, targets: validTargets }, null, 2)}</div>
      </div>
    </>
  );
}

function HealthPanel({ degraded: initialDeg, onClose }) {
  const toast = useToast();
  const [deg, setDeg]         = useState(initialDeg);
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);

  const PROVIDERS_CFG = [
    { key: 'aws',   abbr: 'AWS', name: 'AWS S3',     bg: 'rgba(255,153,0,.12)', tc: '#b45309' },
    { key: 'azure', abbr: 'AZ',  name: 'Azure Blob', bg: 'rgba(0,120,212,.11)', tc: '#1d4ed8' },
    { key: 'gcs',   abbr: 'GCS', name: 'GCS',        bg: 'rgba(52,168,83,.11)', tc: '#166534' },
  ];

  const fetchHealth = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const data = await getHealth();
      setHealthData(data);
      setDeg(false);
      if (showToast) toast('Refreshed', 'ok');
    } catch {
      if (showToast) toast('Health check failed', 'err');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchHealth(false); }, [fetchHealth]);

  const providerInfo = key => {
    if (deg && key === 'azure') return { status: 'error', latencyMs: null, note: 'Connection refused' };
    const p = healthData?.providers?.find(p => p.key === key);
    return p ?? { status: loading ? 'loading' : 'error', latencyMs: null, note: loading ? '…' : 'Could not reach backend' };
  };

  const badge = status => {
    if (status === 'ok')      return { label: 'OK',      bg: 'var(--okb)',  color: 'var(--ok)',  dot: 'var(--ok)' };
    if (status === 'error')   return { label: 'Down',    bg: 'var(--erb)',  color: 'var(--er)',  dot: 'var(--er)' };
    if (status === 'pending') return { label: 'Pending', bg: 'var(--sur2)', color: 'var(--tx3)', dot: 'var(--bd)' };
    return                           { label: '…',       bg: 'var(--sur2)', color: 'var(--tx3)', dot: 'var(--bd)' };
  };

  return (
    <>
      <div className="dw-head">
        <h3>Provider Health</h3>
        <button className="icb" onClick={onClose}>✕</button>
      </div>
      <div className="dw-body">
        {deg && <div className="alert a-err" style={{ marginBottom: 14 }}>⚠ Azure Blob is not responding.</div>}

        {PROVIDERS_CFG.map(({ key, abbr, name, bg, tc }) => {
          const info = providerInfo(key);
          const b    = badge(info.status);
          const lat  = info.latencyMs != null ? `${info.latencyMs} ms` : '—';
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--bd)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, background: bg, color: tc }}>
                {abbr}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>{name}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--tx3)' }}>{info.note ?? '…'}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: b.bg, color: b.color }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.dot, display: 'inline-block' }} />
                  {b.label}
                </span>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>{lat}</div>
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
          <button className="btn btn-s btn-sm btn-full" onClick={() => fetchHealth(true)} disabled={loading}>↻ Refresh</button>
          {deg
            ? <button className="btn btn-s btn-sm btn-full" style={{ color: 'var(--ok)', borderColor: 'var(--okd)' }} onClick={() => { setDeg(false); toast('Azure recovered', 'ok'); }}>✓ Simulate recovery</button>
            : <button className="btn btn-s btn-sm btn-full" style={{ color: 'var(--er)', borderColor: 'var(--erd)' }} onClick={() => { setDeg(true); toast('Azure degraded', 'err'); }}>⚠ Simulate failure</button>
          }
        </div>

        <div className="sep" />
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>API — GET /api/health</div>
        <div className="codeb">{healthData ? JSON.stringify(healthData, null, 2) : (loading ? '…' : '{ "error": "backend unreachable" }')}</div>
      </div>
    </>
  );
}
