const FILE_TYPE_CFG = {
  PDF:  { bg: 'rgba(239,68,68,.14)',   fg: '#dc2626', label: 'PDF' },
  CSV:  { bg: 'rgba(59,130,246,.14)',  fg: '#2563eb', label: 'CSV' },
  JSON: { bg: 'rgba(16,185,129,.14)',  fg: '#059669', label: 'JSON' },
  DOC:  { bg: 'rgba(245,158,11,.14)',  fg: '#d97706', label: 'DOC' },
  DOCX: { bg: 'rgba(245,158,11,.14)',  fg: '#d97706', label: 'DOC' },
  ZIP:  { bg: 'rgba(139,92,246,.14)',  fg: '#7c3aed', label: 'ZIP' },
  MD:   { bg: 'rgba(16,185,129,.14)',  fg: '#059669', label: 'MD' },
  SQL:  { bg: 'rgba(124,58,237,.14)',  fg: '#6d28d9', label: 'SQL' },
  PNG:  { bg: 'rgba(6,182,212,.14)',   fg: '#0891b2', label: 'IMG' },
  JPG:  { bg: 'rgba(6,182,212,.14)',   fg: '#0891b2', label: 'IMG' },
  JPEG: { bg: 'rgba(6,182,212,.14)',   fg: '#0891b2', label: 'IMG' },
  MP4:  { bg: 'rgba(236,72,153,.14)',  fg: '#db2777', label: 'VID' },
  XLSX: { bg: 'rgba(16,185,129,.14)',  fg: '#059669', label: 'XLS' },
  PPTX: { bg: 'rgba(234,88,12,.14)',   fg: '#ea580c', label: 'PPT' },
};

export function FileTypeIcon({ type, size = 32 }) {
  const t = FILE_TYPE_CFG[type] ?? {
    bg: 'rgba(148,163,184,.15)',
    fg: '#64748b',
    label: (type ?? '?').slice(0, 4),
  };
  const s = size;
  return (
    <div style={{
      width: s, height: s, borderRadius: Math.round(s * 0.27),
      background: t.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 2, flexShrink: 0,
    }}>
      <svg viewBox="0 0 14 17" width={s * 0.48} height={s * 0.48} fill="none" aria-hidden="true">
        <path d="M2 1h7l4 4.5V16H2V1z" fill="none" stroke={t.fg} strokeWidth="1.35" strokeLinejoin="round" />
        <path d="M9 1v4.5h4" fill="none" stroke={t.fg} strokeWidth="1.35" strokeLinejoin="round" />
        <line x1="4.5" y1="10" x2="9.5" y2="10" stroke={t.fg} strokeWidth="1.15" strokeLinecap="round" opacity=".55" />
        <line x1="4.5" y1="12.5" x2="8"  y2="12.5" stroke={t.fg} strokeWidth="1.15" strokeLinecap="round" opacity=".55" />
      </svg>
      <span style={{ fontSize: s * 0.21, color: t.fg, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {t.label}
      </span>
    </div>
  );
}

export const PL = { aws: 'AWS S3', azure: 'Azure Blob', gcs: 'GCS' };

// AWS: the distinctive orange arch/smile with outward arrow tips
function AwsIcon({ c, s }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2.5 14 Q10 6 17.5 14" stroke={c} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M2.5 11.5 L2.5 14 L5 13.3" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.5 11.5 L17.5 14 L15 13.3" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Azure: angular A-shape (the Azure logo essence)
function AzureIcon({ c, s }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 17 L10 3 L17 17" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 12.5 L13.5 12.5" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

// GCS: Google G-mark (partial circle + horizontal bar to center)
function GcsIcon({ c, s }) {
  return (
    <svg width={s} height={s} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14 4.8 A6.5 6.5 0 1 0 16.5 10 L10.5 10" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  );
}

const PROVIDER_CFG = [
  { key: 'aws',   label: 'AWS S3',     color: '#FF9900', Icon: AwsIcon },
  { key: 'azure', label: 'Azure Blob', color: '#0078D4', Icon: AzureIcon },
  { key: 'gcs',   label: 'GCS',        color: '#34A853', Icon: GcsIcon },
];

export function ProviderIcons({ providers = [], size = 16 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {PROVIDER_CFG.map(({ key, label, color, Icon }) => {
        const active = providers.includes(key);
        return (
          <div
            key={key}
            title={active ? `✓ On ${label}` : `Not on ${label}`}
            style={{ opacity: active ? 1 : 0.28, transition: 'opacity .12s', flexShrink: 0, lineHeight: 0 }}
          >
            <Icon c={active ? color : 'var(--tx3)'} s={size} />
          </div>
        );
      })}
    </div>
  );
}

// Kept for backward compatibility — use ProviderIcons in new code
export function ProviderDots({ providers = [], size = 9 }) {
  const ALL = [
    { key: 'aws',   color: 'var(--aws)',   label: 'AWS S3' },
    { key: 'azure', color: 'var(--azure)', label: 'Azure Blob' },
    { key: 'gcs',   color: 'var(--gcs)',   label: 'GCS' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {ALL.map(p => (
        <div
          key={p.key}
          title={providers.includes(p.key) ? `✓ On ${p.label}` : `Not on ${p.label}`}
          style={{
            width: size, height: size, borderRadius: '50%',
            background: providers.includes(p.key) ? p.color : 'var(--bd)',
            flexShrink: 0, transition: 'background .12s',
          }}
        />
      ))}
    </div>
  );
}
