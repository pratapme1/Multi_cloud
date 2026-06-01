export const formatSize = bytes => {
  if (!bytes) return '0 B';
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
};

export const getFileType = name => {
  const ext = (name ?? '').split('.').pop().toUpperCase();
  return ext || 'FILE';
};

export const formatAge = date => {
  if (!date) return 'unknown';
  const diff = Date.now() - new Date(date).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60)  return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs} hr ago`;
  if (hrs  < 48)  return 'yesterday';
  return new Date(date).toLocaleDateString();
};
