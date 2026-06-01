import { useState } from 'react';
import { uploadFile } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { FileTypeIcon } from './FileIcons.jsx';

const PROV_OPTIONS = [
  { key: 'aws',   label: 'AWS S3',               color: 'var(--aws)',   abbr: 'AWS' },
  { key: 'azure', label: 'Azure Blob Storage',   color: 'var(--azure)', abbr: 'AZ' },
  { key: 'gcs',   label: 'Google Cloud Storage', color: 'var(--gcs)',   abbr: 'GCS', disabled: true },
];

const formatSize = bytes => {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export default function UploadModal({ onClose, onSuccess }) {
  const toast = useToast();
  const [file, setFile]           = useState(null);
  const [selected, setSelected]   = useState(['aws', 'azure']);
  const [step, setStep]           = useState('default'); // default|ready|uploading|success|error403|partial
  const [uploadResult, setResult] = useState(null);

  const toggle = key => {
    const opt = PROV_OPTIONS.find(p => p.key === key);
    if (opt?.disabled) {
      toast('GCS is a placeholder for now. Use AWS and Azure for local testing.', 'inf');
      return;
    }
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleFileChange = e => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setStep('ready'); }
  };

  const handleUpload = async () => {
    if (!selected.length) { toast('Select at least one provider', 'wa'); return; }
    setStep('uploading');
    try {
      const result = await uploadFile(file, selected);
      setResult(result);
      setStep('success');
      const ok = Object.values(result.results ?? {}).filter(r => r.status === 'ok').length;
      toast(`${file.name} → ${ok}/${selected.length} providers`, 'ok', 'Upload complete');
    } catch (err) {
      if (err?.response?.status === 403) setStep('error403');
      else setStep('partial');
    }
  };

  const fileType = file?.name.split('.').pop().toUpperCase().slice(0, 4);

  return (
    <div className="mlayer" onClick={e => { if (e.target.classList.contains('mlayer')) onClose(); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* ── Default / Ready ── */}
        {(step === 'default' || step === 'ready') && (
          <>
            <div className="mh">
              <div>
                <div className="mt">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                    <path d="M8 11V2M4 6l4-4 4 4M2 14h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload File
                </div>
                <div className="ms">Select file and choose destinations</div>
              </div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>

            <div className="mb2">
              {/* Left: file picker */}
              <div className="mb2-l">
                <label className="fl">File</label>
                {step === 'default' ? (
                  <label className="dz" style={{ cursor: 'pointer', display: 'block' }}>
                    <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    <div style={{ fontSize: '2rem', marginBottom: 6, textAlign: 'center' }}>
                      <svg viewBox="0 0 40 40" width="40" height="40" fill="none" style={{ margin: '0 auto', display: 'block' }}>
                        <circle cx="20" cy="20" r="19" stroke="var(--acd)" strokeWidth="1.5"/>
                        <path d="M20 27V14M14 19l6-6 6 6" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 28h14" stroke="var(--acd)" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx2)', textAlign: 'center' }}>Click to choose a file</div>
                    <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 3, textAlign: 'center' }}>Any type · Max 100 MB</div>
                  </label>
                ) : (
                  <div style={{ padding: '14px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--sur2)', border: '1.5px solid var(--bd)', borderRadius: 12 }}>
                      <FileTypeIcon type={fileType} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--tx3)', marginTop: 2 }}>{formatSize(file.size)}</div>
                      </div>
                      <button
                        className="icb"
                        style={{ color: 'var(--er)', flexShrink: 0 }}
                        onClick={() => { setFile(null); setStep('default'); }}
                        title="Remove file"
                      >✕</button>
                    </div>
                    <label
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 12, color: 'var(--ac)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                      ↻ Choose different file
                    </label>
                  </div>
                )}

                {step === 'ready' && selected.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--wa)', marginTop: 8 }}>⚠ Select at least one destination</div>
                )}
              </div>

              {/* Right: destination checkboxes */}
              <div className="mb2-r">
                <label className="fl">Upload to</label>
                {PROV_OPTIONS.map(p => {
                  const checked = selected.includes(p.key);
                  return (
                    <div
                      key={p.key}
                      className={`pchk${checked ? ' checked' : ''}${p.disabled ? ' disabled' : ''}`}
                      onClick={() => toggle(p.key)}
                      title={p.disabled ? 'GCS placeholder - not enabled for local testing yet' : p.label}
                      style={p.disabled ? { opacity: .55, cursor: 'not-allowed' } : undefined}
                    >
                      <div className="pchk-box">{checked && '✓'}</div>
                      <div className="pdot" style={{ background: p.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{p.label}</span>
                      {p.disabled && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--sur2)', color: 'var(--tx3)', border: '1px solid var(--bd)', padding: '1px 6px', borderRadius: 999 }}>
                          Placeholder
                        </span>
                      )}
                      {checked && selected.length === 2 && p.key === 'azure' && (
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--acb)', color: 'var(--ac)', border: '1px solid var(--acd)', padding: '1px 6px', borderRadius: 999 }}>
                          AWS + Azure
                        </span>
                      )}
                    </div>
                  );
                })}

                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--sur2)', borderRadius: 9, border: '1px solid var(--bd)' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--tx3)', lineHeight: 1.5 }}>
                    {selected.length === 0 && 'No destination selected.'}
                    {selected.length === 1 && `Uploading to ${PROV_OPTIONS.find(p => p.key === selected[0])?.label}.`}
                    {selected.length === 2 && <><strong style={{ color: 'var(--ok)' }}>AWS + Azure ready</strong> - GCS stays as a placeholder for now.</>}
                    {selected.length === 3 && <><strong style={{ color: 'var(--ok)' }}>✓ Fully redundant</strong> — stored on all 3 providers.</>}
                  </div>
                </div>
              </div>
            </div>

            <div className="mf">
              <button className="btn btn-s" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-p"
                onClick={handleUpload}
                disabled={step !== 'ready' || selected.length === 0}
              >
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                  <path d="M7 10V2M3 5l4-4 4 4M1 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload to {selected.length} provider{selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {/* ── Uploading ── */}
        {step === 'uploading' && (
          <>
            <div className="mh"><div className="mt">Uploading…</div></div>
            <div className="mb" style={{ textAlign: 'center', padding: '36px 28px' }}>
              <div style={{ width: 64, height: 64, background: 'var(--acb)', border: '2px solid var(--acd)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.6rem' }}>
                <span className="spin">↻</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Uploading to {selected.length} provider{selected.length > 1 ? 's' : ''}…</div>
              <div style={{ fontSize: '12.5px', color: 'var(--tx3)', marginBottom: 16 }}>{file?.name}</div>
              <div className="ph"><div className="pf" /></div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
                {selected.map(k => {
                  const p = PROV_OPTIONS.find(x => x.key === k);
                  return (
                    <span key={k} style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'var(--acb)', color: 'var(--ac)', border: '1px solid var(--acd)' }}>
                      {p?.abbr}
                    </span>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <>
            <div className="mh">
              <div>
                <div className="mt">Upload complete</div>
                <div className="ms">{selected.length} provider{selected.length > 1 ? 's' : ''}</div>
              </div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>
            <div className="mb">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 58, height: 58, background: 'var(--okb)', border: '2px solid var(--okd)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem', color: 'var(--ok)' }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Upload Successful</div>
                <div style={{ fontSize: '12.5px', color: 'var(--tx3)', marginTop: 3 }}>{file?.name}</div>
              </div>
              {selected.map(k => {
                const p   = PROV_OPTIONS.find(x => x.key === k);
                const res = uploadResult?.results?.[k];
                const ok  = !res || res.status === 'ok';
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', borderBottom: '1px solid var(--bd)' }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: ok ? p.color : 'var(--er)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{p.label}</span>
                    {ok
                      ? <span style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 700 }}>✓ Uploaded</span>
                      : <span style={{ fontSize: 12, color: 'var(--er)', fontWeight: 700 }}>✗ Failed</span>
                    }
                  </div>
                );
              })}
            </div>
            <div className="mf">
              <button className="btn btn-s" onClick={onSuccess ?? onClose}>Close</button>
              <button className="btn btn-p" onClick={() => { setFile(null); setSelected(['aws', 'azure']); setStep('default'); }}>Upload Another</button>
            </div>
          </>
        )}

        {/* ── Partial failure ── */}
        {step === 'partial' && (
          <>
            <div className="mh">
              <div><div className="mt">Partial upload</div><div className="ms">One or more providers failed</div></div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>
            <div className="mb" style={{ textAlign: 'center', padding: '28px 22px' }}>
              <div style={{ width: 58, height: 58, background: 'var(--wab)', border: '2px solid var(--wad)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem', color: 'var(--wa)' }}>⚠</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Partial Upload</div>
              <div style={{ fontSize: '12.5px', color: 'var(--tx3)', marginBottom: 14 }}>One or more selected providers failed</div>
              <div className="alert a-wa" style={{ textAlign: 'left' }}>AWS and Azure are the active local-test providers. GCS is intentionally left as a placeholder.</div>
            </div>
            <div className="mf">
              <button className="btn btn-s" onClick={onSuccess ?? onClose}>Close</button>
              <button className="btn btn-w" onClick={() => { setFile(null); setStep('default'); }}>↻ Retry</button>
            </div>
          </>
        )}

        {/* ── 403 ── */}
        {step === 'error403' && (
          <>
            <div className="mh">
              <div><div className="mt" style={{ color: 'var(--er)' }}>✕ Access Denied</div><div className="ms">403 Forbidden</div></div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>
            <div className="mb" style={{ textAlign: 'center', padding: '28px 22px' }}>
              <div style={{ width: 58, height: 58, background: 'var(--erb)', border: '2px solid var(--erd)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.6rem' }}>🔒</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--er)', marginBottom: 3 }}>Permission Denied</div>
              <div style={{ fontSize: '12.5px', color: 'var(--tx3)' }}>Your account does not have upload permissions.</div>
            </div>
            <div className="mf">
              <button className="btn btn-s" onClick={onClose}>Back to Files</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
