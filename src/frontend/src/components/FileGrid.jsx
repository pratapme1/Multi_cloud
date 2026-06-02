import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { deleteFile, downloadFile } from '../api/index.js';
import { FileTypeIcon, ProviderIcons } from './FileIcons.jsx';

const CARD_COLORS = {
  aws:   ['#FF9900', '#ffb347'],
  azure: ['#0078D4', '#2563eb'],
  gcs:   ['#34A853', '#0ea5e9'],
};

export default function FileGrid({ files, onSelect, onRefresh, selectMode, selectedNames }) {
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

  return (
    <div className="fgrid">
      {files.map((f, i) => {
        const primary   = f.providers[0] ?? 'aws';
        const [c1, c2]  = CARD_COLORS[primary] ?? ['#64748b', '#94a3b8'];
        const isChecked = selectMode && selectedNames.has(f.name);

        return (
          <article
            key={f.name}
            className={`fcard${isChecked ? ' checked' : ''}`}
            style={{ '--card-c1': c1, '--card-c2': c2 }}
            onClick={() => onSelect(i)}
          >
            {/* Checkbox overlay — visible in select mode */}
            {selectMode && (
              <div className="fcard-chk-overlay">
                <span className={`sel-chk${isChecked ? ' on' : ''}`}>
                  {isChecked ? '✓' : ''}
                </span>
              </div>
            )}

            <div className="fcard-ico">
              <FileTypeIcon type={f.type} size={38} />
            </div>
            <div className="fcard-name">{f.name}</div>
            <div className="fcard-meta">{f.size} · {f.modified}</div>
            <div className="uploaded-by card" title={`Uploaded by ${f.uploadedBy ?? f.owner ?? 'Unknown'}`}>
              Uploaded by {f.uploadedBy ?? f.owner ?? 'Unknown'}
            </div>
            <div className="fcard-providers">
              <ProviderIcons providers={f.providers} size={14} />
            </div>

            {/* Action buttons — hidden in select mode */}
            {!selectMode && (
              <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                <button
                  style={{ flex: 1, borderRadius: 8, background: 'var(--sur2)', border: '1.5px solid var(--bd)', padding: '5px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: 'var(--tx2)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  onClick={async e => {
                    e.stopPropagation();
                    toast(`Downloading ${f.name}`, 'ok', 'Download started');
                    try { await downloadFile(f.name, f.providers[0] ?? 'aws'); }
                    catch { toast('Download failed', 'err'); }
                  }}
                >
                  <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
                    <path d="M6 1v7M3 6l3 3 3-3M1 11h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download
                </button>
                {can('delete') && (
                  <button
                    style={{ borderRadius: 8, background: 'var(--sur2)', border: '1.5px solid var(--bd)', padding: '5px 9px', fontSize: 11, cursor: 'pointer', color: 'var(--er)', fontFamily: 'inherit' }}
                    onClick={e => handleDelete(e, f)}
                  >
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="none">
                      <path d="M1.5 3h9M4 3V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M4.5 5v4M7.5 5v4M2 3l.7 7a.5.5 0 00.5.5h5.6a.5.5 0 00.5-.5L10 3"
                        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
