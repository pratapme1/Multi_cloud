import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFiles, getHealth, deleteFile } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Topbar from '../components/Topbar.jsx';
import Shelf from '../components/Shelf.jsx';
import FileList from '../components/FileList.jsx';
import FileGrid from '../components/FileGrid.jsx';
import Drawer from '../components/Drawer.jsx';
import UploadModal from '../components/UploadModal.jsx';

const PAGE_SIZE = 12;

export default function FilesPage({ drawer, selIdx, onDrawer, onSelectFile, onCloseDrawer, refreshKey }) {
  const { can } = useAuth();
  const toast = useToast();

  const [allFiles, setAllFiles]       = useState([]);
  const [pageState, setPageState]     = useState('loading');
  const [filter, setFilter]           = useState('all');
  const [view, setView]               = useState('grid');
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('modified');
  const [sortDir, setSortDir]         = useState('asc');
  const [page, setPage]               = useState(1);
  const [showUpload, setShowUpload]   = useState(false);
  const [lastRefreshed, setRefreshed] = useState(null);
  const [healthDeg, setHealthDeg]     = useState(false);
  const [healthData, setHealthData]   = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // ── Multi-select ────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false);
  const [selectedNames, setSelectedNames] = useState(new Set());
  const [bulkDeleting, setBulkDeleting]   = useState(false);

  // ── Delete all ──────────────────────────────────────────────────
  const [showDeleteAll, setShowDeleteAll]     = useState(false);
  const [deleteAllBusy, setDeleteAllBusy]     = useState(false);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await getHealth();
      setHealthData(data);
      setHealthDeg(data.providers?.some(provider => provider.status === 'error') ?? false);
    } catch {
      setHealthData(null);
      setHealthDeg(true);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setPageState('loading');
    try {
      const data = await getFiles();
      setAllFiles(data);
      setRefreshed(Date.now());
      setPageState(data.length === 0 ? 'empty' : 'loaded');
      loadHealth();
    } catch {
      setPageState('error');
      setHealthDeg(true);
    }
  }, [loadHealth]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => {
    loadHealth();
    const id = window.setInterval(loadHealth, 60000);
    return () => window.clearInterval(id);
  }, [loadHealth]);

  const handleFilter = f => {
    setFilter(f);
    setPage(1);
    onCloseDrawer();
  };

  const handleSearch = q => {
    setSearch(q);
    setPage(1);
  };

  const handleSort = col => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filteredFiles = useMemo(() => {
    let list = filter === 'all'
      ? allFiles
      : allFiles.filter(f => f.providers.includes(filter));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q));
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name')     cmp = a.name.localeCompare(b.name);
      if (sortBy === 'size')     cmp = (a.sizeBytes ?? 0) - (b.sizeBytes ?? 0);
      if (sortBy === 'modified') cmp = (b.modifiedTs ?? 0) - (a.modifiedTs ?? 0);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [allFiles, filter, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / PAGE_SIZE));
  const safeePage  = Math.min(page, totalPages);
  const pageFiles  = filteredFiles.slice((safeePage - 1) * PAGE_SIZE, safeePage * PAGE_SIZE);

  const drawerOpen   = drawer !== null;
  const selectedFile = drawer === 'file' && selIdx >= 0 ? pageFiles[selIdx] : null;

  // ── Select mode handlers ─────────────────────────────────────────
  const enterSelectMode = () => {
    setSelectMode(true);
    setSelectedNames(new Set());
    onCloseDrawer();
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedNames(new Set());
  };

  const handleFileClick = useCallback(idx => {
    if (selectMode) {
      const name = pageFiles[idx]?.name;
      if (!name) return;
      setSelectedNames(prev => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name); else next.add(name);
        return next;
      });
    } else {
      onSelectFile(idx);
    }
  }, [selectMode, pageFiles, onSelectFile]);

  const handleSelectAll = () => {
    const pageNames = pageFiles.map(f => f.name);
    const allSelected = pageNames.every(n => selectedNames.has(n));
    setSelectedNames(prev => {
      const next = new Set(prev);
      if (allSelected) { pageNames.forEach(n => next.delete(n)); }
      else             { pageNames.forEach(n => next.add(n)); }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const count = selectedNames.size;
    if (!count) return;
    if (!window.confirm(`Delete ${count} file${count > 1 ? 's' : ''}?\n\nThis will remove them from all providers and cannot be undone.`)) return;

    const names = [...selectedNames];

    // Optimistic: remove from UI immediately so files vanish on confirm
    setAllFiles(prev => prev.filter(f => !names.includes(f.name)));
    exitSelectMode();
    setBulkDeleting(true);

    const failures = [];
    // Snapshot providers before allFiles state update propagates
    const providerMap = Object.fromEntries(
      allFiles.filter(f => names.includes(f.name)).map(f => [f.name, f.providers])
    );

    await Promise.all(names.map(async name => {
      const providers = providerMap[name];
      if (!providers?.length) return;
      try {
        await deleteFile(name, providers);
      } catch (err) {
        failures.push(name);
        console.error(`[bulk-delete] failed for "${name}":`, err?.message ?? err);
      }
    }));

    if (failures.length === 0) {
      toast(`${names.length} file${names.length !== 1 ? 's' : ''} deleted`, 'ok', 'Bulk delete');
    } else {
      toast(`${names.length - failures.length} deleted · ${failures.length} failed`, 'wa', 'Bulk delete');
    }

    setBulkDeleting(false);
    // Reconcile with actual cloud state
    load();
  };

  const handleDeleteAll = async () => {
    const snapshot = [...allFiles];
    setAllFiles([]);
    setShowDeleteAll(false);
    setDeleteAllBusy(true);

    const failures = [];
    await Promise.all(snapshot.map(async f => {
      try { await deleteFile(f.name, f.providers); }
      catch (err) {
        failures.push(f.name);
        console.error(`[delete-all] failed for "${f.name}":`, err?.message ?? err);
      }
    }));

    if (failures.length === 0) {
      toast(`All ${snapshot.length} files deleted`, 'ok', 'Delete all');
    } else {
      toast(`${snapshot.length - failures.length} deleted · ${failures.length} failed`, 'wa', 'Delete all');
    }
    setDeleteAllBusy(false);
    load();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar
        pageState={pageState}
        onDrawer={onDrawer}
        onUpload={() => setShowUpload(true)}
        search={search}
        onSearch={handleSearch}
        healthDeg={healthDeg}
        healthData={healthData}
        healthLoading={healthLoading}
      />

      <Shelf
        files={allFiles}
        filter={filter}
        view={view}
        onFilter={handleFilter}
        onView={setView}
        onReload={load}
        lastRefreshed={lastRefreshed}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        selectMode={selectMode}
        onToggleSelectMode={selectMode ? exitSelectMode : enterSelectMode}
        canSelect={can('delete')}
        onDeleteAll={can('delete') && allFiles.length > 0 ? () => setShowDeleteAll(true) : null}
      />

      <div className={`cw${drawerOpen ? ' open' : ''}`}>
        <div className="farea">
          {pageState === 'loading' && <LoadingState />}
          {pageState === 'error'   && <ErrorState onRetry={load} onHealth={() => onDrawer('health-deg')} />}
          {pageState === 'empty'   && <EmptyState onUpload={() => setShowUpload(true)} />}
          {pageState === 'loaded'  && (
            <>
              {pageFiles.length === 0 && search ? (
                <div className="empty" style={{ paddingTop: 48 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx2)', marginBottom: 6 }}>No results</div>
                  <div style={{ fontSize: 13, color: 'var(--tx3)' }}>No files match "{search}"</div>
                </div>
              ) : view === 'list' ? (
                <FileList
                  files={pageFiles}
                  selectedIdx={selIdx}
                  onSelect={handleFileClick}
                  onRefresh={load}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                  selectMode={selectMode}
                  selectedNames={selectedNames}
                  onSelectAll={handleSelectAll}
                />
              ) : (
                <FileGrid
                  files={pageFiles}
                  onSelect={handleFileClick}
                  onRefresh={load}
                  selectMode={selectMode}
                  selectedNames={selectedNames}
                />
              )}

              {filteredFiles.length > PAGE_SIZE && (
                <Pager
                  page={safeePage}
                  total={totalPages}
                  count={filteredFiles.length}
                  pageSize={PAGE_SIZE}
                  onChange={setPage}
                />
              )}
            </>
          )}

          {/* Bulk action bar */}
          {selectMode && (
            <div className="bulk-bar">
              <div className="bulk-bar-info">
                <div className="bulk-count-badge">{selectedNames.size}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                  {selectedNames.size === 0
                    ? 'No files selected'
                    : `file${selectedNames.size !== 1 ? 's' : ''} selected`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 7, marginLeft: 'auto', alignItems: 'center' }}>
                <button className="btn btn-s btn-sm" onClick={exitSelectMode}>Cancel</button>
                {can('delete') && selectedNames.size > 0 && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {bulkDeleting ? (
                      <span className="spin">↻</span>
                    ) : (
                      <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                        <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
                          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    Delete {selectedNames.size} file{selectedNames.size !== 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {drawerOpen && (
          <Drawer
            mode={drawer}
            file={selectedFile}
            onClose={onCloseDrawer}
            onSimulateDeg={() => setHealthDeg(true)}
            onRefresh={load}
          />
        )}
      </div>

      {showUpload && (
        <UploadModal
          existingFiles={allFiles}
          onClose={() => { setShowUpload(false); load(); }}
          onSuccess={() => { setShowUpload(false); load(); }}
        />
      )}

      {showDeleteAll && (
        <DeleteAllModal
          count={allFiles.length}
          busy={deleteAllBusy}
          onClose={() => setShowDeleteAll(false)}
          onConfirm={handleDeleteAll}
        />
      )}
    </div>
  );
}

function Pager({ page, total, count, pageSize, onChange }) {
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, count);

  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (total <= 7 || i === 1 || i === total || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="pager">
      <span className="pager-info">{from}–{to} of {count} files</span>
      <button className="pgbtn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} style={{ color: 'var(--tx3)', fontSize: 12, padding: '0 2px' }}>…</span>
          : <button key={p} className={`pgbtn${page === p ? ' on' : ''}`} onClick={() => onChange(p)}>{p}</button>
      )}
      <button className="pgbtn" disabled={page === total} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

function LoadingState() {
  return (
    <div>
      <div className="fl-head">
        <span>Name</span><span>Stored on</span><span>Size</span><span>Modified</span><span />
      </div>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 80px 100px 70px', padding: '0 20px', alignItems: 'center', minHeight: 54, borderBottom: '1px solid var(--bd)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div className="shim" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }} />
            <div>
              <div className="shim" style={{ width: 180, height: 12, marginBottom: 6 }} />
              <div className="shim" style={{ width: 90, height: 10 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div className="shim" style={{ width: 9, height: 9, borderRadius: '50%' }} />
            <div className="shim" style={{ width: 9, height: 9, borderRadius: '50%' }} />
            <div className="shim" style={{ width: 9, height: 9, borderRadius: '50%' }} />
          </div>
          <div className="shim" style={{ width: 52, height: 12 }} />
          <div className="shim" style={{ width: 72, height: 12 }} />
          <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
            <div className="shim" style={{ width: 26, height: 26, borderRadius: 7 }} />
            <div className="shim" style={{ width: 26, height: 26, borderRadius: 7 }} />
          </div>
        </div>
      ))}
      <div style={{ textAlign: 'center', padding: 18, color: 'var(--tx3)', fontSize: 13 }}>
        <span className="spin">↻</span> Connecting to providers…
      </div>
    </div>
  );
}

function EmptyState({ onUpload }) {
  return (
    <div className="empty">
      <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>☁</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx2)', marginBottom: 6 }}>No files yet</div>
      <div style={{ fontSize: 13, marginBottom: 20 }}>Upload your first file to get started.</div>
      <button className="btn btn-p" onClick={onUpload}>↑ Upload your first file</button>
    </div>
  );
}

function ErrorState({ onRetry, onHealth }) {
  return (
    <>
      <div style={{ padding: 20 }}>
        <div className="alert a-err">
          ⚠ Could not connect to provider.
          <button className="btn btn-s btn-sm" style={{ marginLeft: 8 }} onClick={onRetry}>↻ Retry</button>
        </div>
      </div>
      <div className="empty" style={{ paddingTop: 20 }}>
        <div style={{ fontSize: '2.4rem', marginBottom: 10, color: 'var(--er)' }}>✕</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--er)', marginBottom: 6 }}>Provider Unavailable</div>
        <div style={{ fontSize: 13, color: 'var(--tx3)', marginBottom: 20 }}>One or more providers is not responding.</div>
        <button className="btn btn-s" style={{ marginRight: 8 }} onClick={onHealth}>View Health</button>
        <button className="btn btn-p" onClick={onRetry}>↻ Retry</button>
      </div>
    </>
  );
}

function DeleteAllModal({ count, busy, onClose, onConfirm }) {
  const [input, setInput] = useState('');
  const PHRASE = 'delete all';
  const valid = input.trim().toLowerCase() === PHRASE;

  return (
    <div className="mlayer" onClick={e => { if (e.target.classList.contains('mlayer') && !busy) onClose(); }}>
      <div className="modal da-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mh da-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="da-icon">
              <svg viewBox="0 0 20 20" width="22" height="22" fill="none">
                <path d="M10 2L2 17h16L10 2z" stroke="#ef4444" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(239,68,68,.12)"/>
                <path d="M10 8v4M10 14.5v.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="mt" style={{ color: 'var(--er)' }}>Delete All Files</div>
              <div className="ms">Permanent · irreversible · affects all providers</div>
            </div>
          </div>
          <button className="icb" onClick={onClose} disabled={busy}>✕</button>
        </div>

        {/* Warning body */}
        <div className="mb">
          <div className="da-warn-box">
            <div className="da-warn-title">
              You are about to delete all {count} file{count !== 1 ? 's' : ''} permanently.
            </div>
            <ul className="da-warn-list">
              <li>Every file will be removed from <strong>AWS S3, Azure Blob Storage, and Google Cloud Storage</strong></li>
              <li>There is <strong>no trash, no undo, and no recovery</strong> after this action</li>
              <li>All team members will immediately lose access to these files</li>
              <li>Signed URLs and download links for these files will stop working</li>
            </ul>
          </div>

          <div className="da-divider" />

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--tx2)' }}>
              To confirm, type{' '}
              <span className="da-phrase">delete all</span>
              {' '}in the box below:
            </span>
          </div>

          <div className="fg" style={{ margin: 0 }}>
            <input
              autoFocus
              autoComplete="off"
              placeholder="Type: delete all"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && valid && !busy) onConfirm(); }}
              className={input.length > 0 ? (valid ? 'da-input-ok' : 'err') : ''}
              style={{
                borderColor: input.length > 0 ? (valid ? 'var(--ok)' : 'var(--er)') : undefined,
                boxShadow: input.length > 0 && valid ? '0 0 0 3px rgba(16,185,129,.15)' : input.length > 0 ? '0 0 0 3px rgba(239,68,68,.12)' : undefined,
                fontFamily: 'monospace',
                fontSize: 14,
                letterSpacing: '.04em',
              }}
            />
          </div>

          {input.length > 0 && !valid && (
            <div style={{ fontSize: 12, color: 'var(--er)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6 3.5v3M6 8v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Must match exactly: <strong style={{ fontFamily: 'monospace' }}>delete all</strong>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mf">
          <button className="btn btn-s" onClick={onClose} disabled={busy}>
            Cancel — keep files
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={!valid || busy}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 180 }}
          >
            {busy ? (
              <><span className="spin">↻</span> Deleting…</>
            ) : (
              <>
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
                  <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Delete all {count} files forever
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
