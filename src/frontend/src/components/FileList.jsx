import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { deleteFile, downloadFile } from '../api/index.js';
import { FileTypeIcon, ProviderIcons } from './FileIcons.jsx';

export default function FileList({ files, selectedIdx, onSelect, onRefresh, sortBy, sortDir, onSort }) {
  const { can } = useAuth();
  const toast = useToast();

  const handleDelete = async (e, file) => {
    e.stopPropagation();
    if (!confirm(`Delete "${file.name}"?\n\nThis cannot be undone.`)) return;
    try {
      await deleteFile(file.name, file.providers);
      toast(`Deleted ${file.name}`, 'ok', 'Deleted');
      onRefresh();
    } catch {
      toast('Delete failed', 'err');
    }
  };

  const handleDownload = async (e, file) => {
    e.stopPropagation();
    toast(`Downloading ${file.name}`, 'ok', 'Download started');
    try {
      await downloadFile(file.name, file.providers[0] ?? 'aws');
    } catch {
      toast(`Download failed`, 'err');
    }
  };

  const sortCls = col => {
    if (!onSort) return '';
    if (sortBy !== col) return 'sortable';
    return `sortable ${sortDir}`;
  };

  return (
    <div style={{ flex: 1 }}>
      <div className="fl-head">
        <span
          className={sortCls('name')}
          onClick={() => onSort?.('name')}
          title="Sort by name"
        >Name</span>
        <span>Stored on</span>
        <span
          className={sortCls('size')}
          onClick={() => onSort?.('size')}
          title="Sort by size"
        >Size</span>
        <span
          className={sortCls('modified')}
          onClick={() => onSort?.('modified')}
          title="Sort by date"
        >Modified</span>
        <span />
      </div>

      {files.map((f, i) => (
        <div
          key={f.name}
          className={`frow${selectedIdx === i ? ' sel' : ''}`}
          onClick={() => onSelect(i)}
        >
          <div className="fr-name">
            <FileTypeIcon type={f.type} size={34} />
            <div style={{ minWidth: 0 }}>
              <div className="fr-fn">{f.name}</div>
              <div className="fr-fm">
                <span>{f.providers.length === 3 ? 'All 3 providers' : `${f.providers.length} provider${f.providers.length > 1 ? 's' : ''}`}</span>
                <span className="uploaded-by" title={`Uploaded by ${f.uploadedBy ?? f.owner ?? 'Unknown'}`}>
                  Uploaded by {f.uploadedBy ?? f.owner ?? 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ProviderIcons providers={f.providers} size={16} />
          </div>

          <div className="fr-sz">{f.size}</div>
          <div className="fr-dt">{f.modified}</div>
          <div className="fr-acts">
            <button className="icb" title="Download" onClick={e => handleDownload(e, f)}>
              <svg viewBox="0 0 14 14" width="13" height="13" fill="none">
                <path d="M7 2v7M4 7l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {can('delete') && (
              <button className="icb" title="Delete" style={{ color: 'var(--er)' }} onClick={e => handleDelete(e, f)}>
                <svg viewBox="0 0 14 14" width="13" height="13" fill="none">
                  <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 8a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5l.7-8"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
