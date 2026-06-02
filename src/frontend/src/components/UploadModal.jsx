import { useState } from 'react';
import { uploadFile } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { FileTypeIcon } from './FileIcons.jsx';

const PROV_OPTIONS = [
  { key: 'aws',   label: 'AWS S3',               color: '#f59e0b', abbr: 'AWS' },
  { key: 'azure', label: 'Azure Blob Storage',   color: '#3b82f6', abbr: 'AZ'  },
  { key: 'gcs',   label: 'Google Cloud Storage', color: '#22c55e', abbr: 'GCS' },
];

const formatSize = bytes => {
  if (bytes < 1024)    return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const splitName = name => {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return { base: name, ext: '' };
  return { base: name.slice(0, dot), ext: name.slice(dot) };
};

const nextAvailableName = (name, takenSet) => {
  const { base, ext } = splitName(name);
  let i = 1;
  let candidate = `${base} (${i})${ext}`;
  while (takenSet.has(candidate.toLowerCase())) {
    i += 1;
    candidate = `${base} (${i})${ext}`;
  }
  return candidate;
};

const fileExt = name => name.split('.').pop().toUpperCase().slice(0, 4);

export default function UploadModal({ existingFiles = [], onClose, onSuccess }) {
  const toast = useToast();
  const [files, setFiles]         = useState([]);
  const [selected, setSelected]   = useState(['aws', 'azure']);
  const [step, setStep]           = useState('default');
  const [uploadProgress, setUploadProgress] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [dragOver, setDragOver]   = useState(false);

  const existingNames = new Set(
    existingFiles.map(f => f.name).filter(Boolean).map(n => n.toLowerCase())
  );

  const toggle = key =>
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const applyFiles = picked => {
    if (!picked.length) return;
    setFiles(picked);
    setUploadProgress({});
    setDuplicates([]);
    setStep('ready');
  };

  const handleFilesChange = e => applyFiles(Array.from(e.target.files ?? []));
  const handleAddMore     = e => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    setFiles(prev => [...prev, ...picked]);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    applyFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const removeFile = idx => {
    const updated = files.filter((_, i) => i !== idx);
    if (!updated.length) { setFiles([]); setStep('default'); } else setFiles(updated);
  };

  const handleUpload = () => {
    if (!files.length || !selected.length) {
      toast('Select at least one provider', 'wa');
      return;
    }
    const dupes = files.map(f => f.name).filter(n => existingNames.has(n.toLowerCase()));
    if (dupes.length) {
      setDuplicates(dupes);
      setStep('duplicate');
      return;
    }
    const names = {};
    files.forEach(f => { names[f.name] = f.name; });
    startUploads(names);
  };

  const handleReplaceAll = () => {
    const names = {};
    files.forEach(f => { names[f.name] = f.name; });
    startUploads(names);
  };

  const handleRenameAll = () => {
    const taken = new Set(existingNames);
    const names = {};
    files.forEach(f => {
      if (taken.has(f.name.toLowerCase())) {
        const newName = nextAvailableName(f.name, taken);
        names[f.name] = newName;
        taken.add(newName.toLowerCase());
      } else {
        names[f.name] = f.name;
        taken.add(f.name.toLowerCase());
      }
    });
    startUploads(names);
  };

  const startUploads = async namesMap => {
    setStep('uploading');
    const prog = {};
    files.forEach(f => {
      prog[f.name] = { status: 'pending', results: {}, finalName: namesMap[f.name] ?? f.name };
    });
    setUploadProgress({ ...prog });

    let hasError = false;
    for (const f of files) {
      const finalName = namesMap[f.name] ?? f.name;
      prog[f.name] = { ...prog[f.name], status: 'uploading' };
      setUploadProgress({ ...prog });
      try {
        const result = await uploadFile(f, selected, { name: finalName });
        const ok = Object.values(result.results ?? {}).filter(r => r.status === 'ok').length;
        const allOk = ok === selected.length;
        if (!allOk) hasError = true;
        prog[f.name] = { status: allOk ? 'done' : 'partial', results: result.results ?? {}, finalName };
        setUploadProgress({ ...prog });
      } catch (err) {
        hasError = true;
        if (err?.response?.status === 403) { setStep('error403'); return; }
        prog[f.name] = { status: 'error', results: {}, error: err.message, finalName };
        setUploadProgress({ ...prog });
      }
    }
    setStep(hasError ? 'partial' : 'success');
    toast(
      `${files.length} file${files.length > 1 ? 's' : ''} — ${hasError ? 'some failures' : 'all uploaded'}`,
      hasError ? 'wa' : 'ok',
      'Upload complete'
    );
  };

  const resetModal = () => {
    setFiles([]);
    setSelected(['aws', 'azure']);
    setUploadProgress({});
    setDuplicates([]);
    setStep('default');
  };

  const handleLayerClick = e => {
    if (!e.target.classList.contains('mlayer')) return;
    if (step === 'uploading') {
      toast('Upload is still running. Keep this window open until it finishes.', 'inf', 'Upload in progress');
      return;
    }
    onClose();
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const doneCount = Object.values(uploadProgress).filter(p => p.status === 'done').length;
  const totalFiles = files.length;

  return (
    <div className="mlayer" onClick={handleLayerClick}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* ── Default / Ready ──────────────────────────────── */}
        {(step === 'default' || step === 'ready') && (
          <>
            <div className="mh">
              <div>
                <div className="mt">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                    <path d="M8 11V2M4 6l4-4 4 4M2 14h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload Files
                </div>
                <div className="ms">Select one or more files · choose destinations</div>
              </div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>

            <div className="mb2">
              {/* Left: file picker */}
              <div className="mb2-l">
                <label className="fl">
                  Files
                  {files.length > 0 && (
                    <span style={{ color: 'var(--tx3)', fontWeight: 500, marginLeft: 5 }}>
                      ({files.length} selected · {formatSize(totalSize)})
                    </span>
                  )}
                </label>

                {step === 'default' ? (
                  <label
                    className={`dz${dragOver ? ' drag-over' : ''}`}
                    style={{ cursor: 'pointer', display: 'block' }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <input type="file" multiple style={{ display: 'none' }} onChange={handleFilesChange} />
                    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" style={{ margin: '0 auto 8px', display: 'block' }}>
                      <circle cx="20" cy="20" r="19" stroke="var(--acd)" strokeWidth="1.5"/>
                      <path d="M20 27V14M14 19l6-6 6 6" stroke="var(--ac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 28h14" stroke="var(--acd)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--tx2)', textAlign: 'center' }}>
                      Click or drag &amp; drop files
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--tx3)', marginTop: 4, textAlign: 'center' }}>
                      Multiple files · Any type · Max 100 MB each
                    </div>
                  </label>
                ) : (
                  <>
                    <div className="upload-file-list">
                      {files.map((f, i) => (
                        <div key={i} className="upload-file-row">
                          <FileTypeIcon type={fileExt(f.name)} size={28} />
                          <div className="file-meta">
                            <div className="file-name-1" title={f.name}>{f.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 1 }}>{formatSize(f.size)}</div>
                          </div>
                          <button
                            className="icb"
                            style={{ color: 'var(--er)', flexShrink: 0 }}
                            onClick={() => removeFile(i)}
                            title="Remove"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ac)', fontWeight: 600, cursor: 'pointer' }}>
                        <input type="file" multiple style={{ display: 'none' }} onChange={handleAddMore} />
                        + Add more files
                      </label>
                    </div>
                  </>
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
                    <div key={p.key} className={`pchk${checked ? ' checked' : ''}`} onClick={() => toggle(p.key)} title={p.label}>
                      <div className="pchk-box">{checked && '✓'}</div>
                      <div className="pdot" style={{ background: p.color }} />
                      <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{p.label}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--sur2)', borderRadius: 9, border: '1px solid var(--bd)' }}>
                  <div style={{ fontSize: 11.5, color: 'var(--tx3)', lineHeight: 1.5 }}>
                    {selected.length === 0 && 'No destination selected.'}
                    {selected.length === 1 && `Uploading to ${PROV_OPTIONS.find(p => p.key === selected[0])?.label}.`}
                    {selected.length === 2 && <strong style={{ color: 'var(--ok)' }}>Uploading to {selected.map(k => PROV_OPTIONS.find(p => p.key === k)?.abbr).join(' + ')}.</strong>}
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
                Upload {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} to` : 'to'} {selected.length} provider{selected.length !== 1 ? 's' : ''}
              </button>
            </div>
          </>
        )}

        {/* ── Duplicate detection ──────────────────────────── */}
        {step === 'duplicate' && (
          <>
            <div className="mh">
              <div>
                <div className="mt">Duplicate files detected</div>
                <div className="ms">{duplicates.length} file{duplicates.length > 1 ? 's already exist' : ' already exists'}</div>
              </div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>
            <div className="mb">
              <div style={{ padding: '10px 13px', background: 'var(--sur2)', borderRadius: 10, border: '1px solid var(--bd)', marginBottom: 14 }}>
                {duplicates.map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < duplicates.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--wa)', display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--tx)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 14 }}>How do you want to handle these?</div>
              <div className="dup-actions">
                <button className="btn btn-s" onClick={() => setStep('ready')}>Cancel</button>
                <button className="btn btn-w" onClick={handleReplaceAll}>Replace existing</button>
                <button className="btn btn-p" onClick={handleRenameAll}>
                  Keep both <span style={{ opacity: .6, fontSize: 11, marginLeft: 4 }}>(auto-rename)</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Uploading ────────────────────────────────────── */}
        {step === 'uploading' && (
          <>
            <div className="mh">
              <div className="mt">
                Uploading {doneCount}/{totalFiles} file{totalFiles > 1 ? 's' : ''}…
              </div>
            </div>
            <div className="mb">
              {/* Rainbow animated progress bar */}
              <div className="upload-rainbow-wrap">
                <div className="upload-rainbow-track">
                  <div className="upload-rainbow-bar" />
                  <div className="upload-rainbow-sheen" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{doneCount} of {totalFiles} complete</span>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{formatSize(totalSize)} total</span>
                </div>
              </div>

              {/* Provider chips */}
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '14px 0' }}>
                {selected.map(k => {
                  const p = PROV_OPTIONS.find(x => x.key === k);
                  return (
                    <span key={k} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 999,
                      fontSize: 11.5, fontWeight: 800,
                      background: `${p.color}18`, color: p.color,
                      border: `1.5px solid ${p.color}55`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, animation: 'blinkDot 1s ease-in-out infinite', display: 'inline-block' }} />
                      {p.abbr}
                    </span>
                  );
                })}
              </div>

              {/* Per-file progress rows */}
              <div className="upload-prog-list">
                {files.map((f, i) => {
                  const prog = uploadProgress[f.name] ?? { status: 'pending' };
                  return (
                    <div key={i} className="upload-prog-row">
                      <FileTypeIcon type={fileExt(f.name)} size={24} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="file-name-1" title={f.name} style={{ fontSize: 12 }}>{f.name}</div>
                        <div className="upload-mini-bar-wrap">
                          <div className={`upload-mini-bar ${prog.status}`} />
                        </div>
                      </div>
                      <div className="upload-prog-icon">
                        {prog.status === 'pending'   && <span style={{ color: 'var(--tx3)', fontSize: 10 }}>–</span>}
                        {prog.status === 'uploading' && <span className="spin" style={{ color: 'var(--ac)', fontSize: 14 }}>↻</span>}
                        {prog.status === 'done'      && <span style={{ color: 'var(--ok)', fontWeight: 800, fontSize: 13 }}>✓</span>}
                        {prog.status === 'partial'   && <span style={{ color: 'var(--wa)', fontWeight: 800, fontSize: 13 }}>⚠</span>}
                        {prog.status === 'error'     && <span style={{ color: 'var(--er)', fontWeight: 800, fontSize: 13 }}>✕</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="upload-keep-open">Upload is active — do not close this window.</div>
            </div>
          </>
        )}

        {/* ── Success / Partial ────────────────────────────── */}
        {(step === 'success' || step === 'partial') && (
          <>
            <div className="mh">
              <div>
                <div className="mt">{step === 'success' ? 'Upload complete' : 'Partial upload'}</div>
                <div className="ms">{totalFiles} file{totalFiles > 1 ? 's' : ''} · {selected.length} provider{selected.length > 1 ? 's' : ''}</div>
              </div>
              <button className="icb" onClick={onClose}>✕</button>
            </div>
            <div className="mb">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 54, height: 54,
                  background: step === 'success' ? 'var(--okb)' : 'var(--wab)',
                  border: `2px solid ${step === 'success' ? 'var(--okd)' : 'var(--wad)'}`,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px', fontSize: '1.4rem',
                  color: step === 'success' ? 'var(--ok)' : 'var(--wa)',
                }}>
                  {step === 'success' ? '✓' : '⚠'}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  {step === 'success' ? 'All files uploaded successfully' : 'Some providers failed'}
                </div>
              </div>

              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {files.map((f, i) => {
                  const prog = uploadProgress[f.name] ?? {};
                  return (
                    <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--bd)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                        <FileTypeIcon type={fileExt(f.name)} size={20} />
                        <span style={{ fontSize: 12.5, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prog.finalName ?? f.name}
                        </span>
                        {prog.status === 'done'    && <span style={{ fontSize: 11, color: 'var(--ok)', fontWeight: 700 }}>✓ OK</span>}
                        {prog.status === 'partial' && <span style={{ fontSize: 11, color: 'var(--wa)', fontWeight: 700 }}>⚠ Partial</span>}
                        {prog.status === 'error'   && <span style={{ fontSize: 11, color: 'var(--er)', fontWeight: 700 }}>✕ Failed</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingLeft: 28 }}>
                        {selected.map(k => {
                          const p  = PROV_OPTIONS.find(x => x.key === k);
                          const r  = prog.results?.[k];
                          const ok = !r || r.status === 'ok';
                          return (
                            <span key={k} style={{
                              fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999,
                              background: ok ? `${p.color}18` : 'var(--erb)',
                              color: ok ? p.color : 'var(--er)',
                              border: `1px solid ${ok ? `${p.color}40` : 'var(--erd)'}`,
                            }}>
                              {p.abbr} {ok ? '✓' : '✕'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {step === 'partial' && (
                <div className="alert a-wa" style={{ textAlign: 'left', marginTop: 12 }}>
                  <span>Direct browser uploads need CORS enabled on AWS S3 and Azure Blob for this Vercel domain.</span>
                </div>
              )}
            </div>
            <div className="mf">
              <button className="btn btn-s" onClick={onSuccess ?? onClose}>Close</button>
              <button className="btn btn-p" onClick={resetModal}>Upload More</button>
            </div>
          </>
        )}

        {/* ── 403 ─────────────────────────────────────────── */}
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
