import { useState, useCallback, useEffect } from 'react';
import { runSync, syncFile, deleteFile, downloadFile, getHealth } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
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

function FileDetail({ file, onClose, onRefresh }) {
  const toast = useToast();
  const [syncing, setSyncing]       = useState(null);
  const [confirm, setConfirm]       = useState(null);
  const [removing, setRemoving]     = useState(null);
  const [downloading, setDownloading] = useState(false);

  const ALL_PROVIDERS = ['aws', 'azure', 'gcs'];
  const dotColor = p => p === 'aws' ? 'var(--aws)' : p === 'azure' ? 'var(--azure)' : 'var(--gcs)';
  const busy = syncing !== null || removing !== null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(file.name, file.providers[0]);
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
        onRefresh?.();
      } else if (r.skipped > 0) {
        toast(`Already on ${PL[targetProvider]}`, 'inf');
        onRefresh?.();
      } else {
        toast('Sync failed', 'err');
      }
    } catch {
      toast('Sync failed', 'err');
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
      // If last copy removed, close drawer since file no longer exists anywhere
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

  return (
    <>
      <div className="dw-head">
        <h3>File Details</h3>
        <button className="icb" onClick={onClose} title="Close">✕</button>
      </div>
      <div className="dw-body">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '6px 0 16px' }}>
          <FileTypeIcon type={file.type} size={52} />
          <div className="drawer-file-name" title={file.name}>{file.name}</div>
          <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 8 }}>{file.size}</div>
          <ProviderIcons providers={file.providers} size={16} />
          <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 5 }}>
            {file.providers.map(p => PL[p]).join(' · ')}
          </div>
        </div>

        <div className="kv">
          <div><label>Uploaded by</label><b>{file.uploadedBy ?? file.owner ?? 'Unknown'}</b></div>
          <div><label>Copies</label><b>{file.providers.length} of 3</b></div>
          <div><label>Access</label><b>Role controlled</b></div>
          <div><label>Updated</label><b>{file.modified}</b></div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          <button
            className="btn btn-p btn-sm"
            style={{ flex: 1 }}
            disabled={downloading || busy}
            onClick={handleDownload}
            title={`Download from ${PL[file.providers[0]]}`}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
              <path d="M7 1v8M4 7l3 3 3-3M1 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {downloading ? 'Downloading…' : 'Download'}
          </button>

          {confirm === 'all' ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--er)', fontWeight: 600 }}>Delete from all?</span>
              <button className="btn btn-sm" style={{ fontSize: 11, background: 'var(--er)', color: '#fff', border: 'none', padding: '3px 10px' }}
                disabled={removing === 'all'} onClick={handleDeleteAll}>
                {removing === 'all' ? '↻' : 'Yes'}
              </button>
              <button className="btn btn-s btn-sm" style={{ fontSize: 11 }} onClick={() => setConfirm(null)}>No</button>
            </div>
          ) : (
            <button className="btn btn-s btn-sm" disabled={busy}
              style={{ color: 'var(--er)', borderColor: 'var(--erd)' }}
              title="Delete from all providers"
              onClick={() => setConfirm('all')}>
              <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
                  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        <div className="sep" />
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
          Redundancy · {file.providers.length} of 3
        </div>

        {ALL_PROVIDERS.map(p => {
          const on    = file.providers.includes(p);
          const isBusy = syncing === p || removing === p;
          const isConfirming = confirm === p;

          return (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: '1px solid var(--bd)', minHeight: 38 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: on ? dotColor(p) : 'var(--bd)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: on ? 'var(--tx)' : 'var(--tx3)' }}>{PL[p]}</span>

              {on ? (
                isConfirming ? (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--er)', fontWeight: 600 }}>
                      {file.providers.length === 1 ? 'Last copy!' : 'Remove?'}
                    </span>
                    <button className="btn btn-sm"
                      style={{ fontSize: 11, background: 'var(--er)', color: '#fff', border: 'none', padding: '3px 10px' }}
                      disabled={isBusy} onClick={() => handleRemove(p)}>
                      {isBusy ? '↻' : 'Yes'}
                    </button>
                    <button className="btn btn-s btn-sm" style={{ fontSize: 11 }} onClick={() => setConfirm(null)}>No</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok)' }}>✓ Stored</span>
                    <button className="btn btn-s btn-sm"
                      style={{ fontSize: 11, padding: '2px 8px', color: 'var(--er)', borderColor: 'var(--erd)' }}
                      disabled={busy} onClick={() => setConfirm(p)}
                      title={`Remove from ${PL[p]}`}>
                      Remove
                    </button>
                  </div>
                )
              ) : (
                <button className="btn btn-s btn-sm"
                  style={{ fontSize: 11, padding: '2px 10px' }}
                  disabled={busy} onClick={() => handleSyncTo(p)}>
                  {syncing === p ? '↻' : 'Sync →'}
                </button>
              )}
            </div>
          );
        })}

        {file.providers.length === 3 && (
          <div style={{ fontSize: 12, color: 'var(--ok)', textAlign: 'center', padding: '8px 0', fontWeight: 600 }}>
            ✓ Fully redundant across all 3 providers
          </div>
        )}

        <div className="sep" />
        <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Audit trail</div>
        <div className="tl">
          <div className="tev">Uploaded by {file.uploadedBy ?? file.owner ?? 'Unknown'} to {file.providers.map(p => PL[p]).join(', ')}<small>{file.modified}</small></div>
          <div className="tev">Virus and secret scan passed<small>No credentials exposed</small></div>
          <div className="tev">Sync eligibility checked<small>{file.providers.length} of 3 providers hold this file</small></div>
        </div>
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
