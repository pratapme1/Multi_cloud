import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFiles, getHealth } from '../api/index.js';
import Topbar from '../components/Topbar.jsx';
import Shelf from '../components/Shelf.jsx';
import FileList from '../components/FileList.jsx';
import FileGrid from '../components/FileGrid.jsx';
import Drawer from '../components/Drawer.jsx';
import UploadModal from '../components/UploadModal.jsx';

const PAGE_SIZE = 8;

export default function FilesPage({ drawer, selIdx, onDrawer, onSelectFile, onCloseDrawer, refreshKey }) {
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
                  onSelect={onSelectFile}
                  onRefresh={load}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              ) : (
                <FileGrid files={pageFiles} onSelect={onSelectFile} onRefresh={load} />
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
        </div>

        {drawerOpen && (
          <Drawer
            mode={drawer}
            file={selectedFile}
            onClose={onCloseDrawer}
            onSimulateDeg={() => setHealthDeg(true)}
          />
        )}
      </div>

      {showUpload && (
        <UploadModal
          existingFiles={allFiles}
          onClose={() => setShowUpload(false)}
          onSuccess={() => { setShowUpload(false); load(); }}
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
      {[...Array(8)].map((_, i) => (
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
