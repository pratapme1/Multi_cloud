import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ pageState, onDrawer, onUpload, search, onSearch, healthDeg }) {
  const { user, can, roleLabel } = useAuth();
  const isError    = pageState === 'error';
  const isLoading  = pageState === 'loading';
  const isReadonly = user?.role === 'viewer';

  const awsOk   = true;
  const azureOk = !isError && !healthDeg;
  const gcsOk   = true;

  return (
    <header className="topbar">
      <span className="tb-title">Files</span>

      <div className="tb-search">
        <input
          type="text"
          placeholder="Search files…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          aria-label="Search files"
        />
      </div>

      <div className="tb-right">
        {isReadonly && (
          <span style={{ fontSize: 12, color: 'var(--tx3)', padding: '0 4px', fontWeight: 600 }}>
            {roleLabel(user?.role)}
          </span>
        )}
        {!isLoading && !isError && can('sync') && (
          <button className="btn btn-s btn-sm" onClick={() => onDrawer('sync')}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" style={{ flexShrink: 0 }}>
              <path d="M2.5 8A5.5 5.5 0 018 2.5a5.5 5.5 0 015.1 3.5M13.5 8A5.5 5.5 0 018 13.5 5.5 5.5 0 012.9 10"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 3.5l1.6-1L15 4.5M4 12.5l-1.6 1L1 12"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sync
          </button>
        )}
        <button
          className="btn btn-s btn-sm"
          style={isError ? { borderColor: 'var(--erd)', color: 'var(--er)' } : {}}
          onClick={() => onDrawer(isError ? 'health-deg' : 'health')}
          title="Provider health"
        >
          <span className="hbtn">
            <span className="hbtn-dots">
              <span className="hdot" style={{ background: awsOk   ? 'var(--ok)' : 'var(--er)' }} title="AWS S3" />
              <span className="hdot" style={{ background: azureOk ? 'var(--ok)' : 'var(--er)' }} title="Azure Blob" />
              <span className="hdot" style={{ background: gcsOk   ? 'var(--ok)' : 'var(--er)' }} title="GCS" />
            </span>
            Health
          </span>
        </button>
        {can('upload') && !isLoading && (
          <button className="btn btn-p btn-sm" onClick={onUpload} disabled={isLoading}>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
              <path d="M8 11V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 13h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            Upload
          </button>
        )}
      </div>
    </header>
  );
}
