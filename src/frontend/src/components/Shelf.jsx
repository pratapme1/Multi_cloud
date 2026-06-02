const FILTERS = [
  { key: 'all',   label: 'All',   dot: '#64748b' },
  { key: 'aws',   label: 'AWS',   dot: 'var(--aws)' },
  { key: 'azure', label: 'Azure', dot: 'var(--azure)' },
  { key: 'gcs',   label: 'GCS',   dot: 'var(--gcs)' },
];

function formatSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function formatAge(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Shelf({
  files, filter, view, onFilter, onView, onReload, lastRefreshed,
  sortBy, sortDir, onSort,
  selectMode, onToggleSelectMode, canSelect,
}) {
  const counts = {
    all:   files.length,
    aws:   files.filter(f => f.providers.includes('aws')).length,
    azure: files.filter(f => f.providers.includes('azure')).length,
    gcs:   files.filter(f => f.providers.includes('gcs')).length,
  };

  const totalBytes    = files.reduce((s, f) => s + (f.sizeBytes ?? 0), 0);
  const redundantPct  = files.length
    ? Math.round(files.filter(f => f.providers.length > 1).length / files.length * 100)
    : 0;

  return (
    <div className="shelf">
      <div className="ftabs">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`ftab${filter === f.key ? ' on' : ''}`}
            onClick={() => onFilter(f.key)}
          >
            <span className="fdot" style={{ background: f.dot }} />
            {f.label}
            <span style={{ color: filter === f.key ? 'var(--ac)' : 'var(--tx3)', fontSize: 11 }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      <span className="shelf-sum">
        {files.length} files · {formatSize(totalBytes)} · {redundantPct}% redundant
      </span>

      <div className="shelf-r">
        {lastRefreshed && (
          <span className="refresh-ts" title={new Date(lastRefreshed).toLocaleString()}>
            <svg viewBox="0 0 12 12" width="11" height="11" fill="none" style={{ color: 'var(--tx3)' }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {formatAge(lastRefreshed)}
          </span>
        )}

        {canSelect && files.length > 0 && (
          <button
            className={`btn btn-sm${selectMode ? ' btn-select-active' : ' btn-s'}`}
            onClick={onToggleSelectMode}
            title={selectMode ? 'Exit selection mode' : 'Select files to delete'}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
              <rect x="1.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="7.5" y="1.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1.5" y="7.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              {selectMode
                ? <path d="M8.5 10l1.3 1.5L12 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                : <rect x="7.5" y="7.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
              }
            </svg>
            {selectMode ? 'Cancel' : 'Select'}
          </button>
        )}

        <div className="vtog">
          <button className={`vbtn${view === 'list' ? ' on' : ''}`} onClick={() => onView('list')} title="List view">
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
              <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <button className={`vbtn${view === 'grid' ? ' on' : ''}`} onClick={() => onView('grid')} title="Grid view">
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
              <rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <button className="btn btn-s btn-sm" onClick={onReload} title="Refresh files">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none">
            <path d="M13.2 5.2A5.8 5.8 0 0 0 3.6 4.1L2.5 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M2.5 2.5v2.7h2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.8 10.8a5.8 5.8 0 0 0 9.6 1.1l1.1-1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M13.5 13.5v-2.7h-2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
