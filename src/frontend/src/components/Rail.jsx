import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Rail({ activeDrawer, onDrawer, onLogoClick }) {
  const { dark, toggleTheme } = useTheme();
  const { user, signOut, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isFilesActive = location.pathname.includes('/app/files') && !activeDrawer;
  const isSyncActive  = activeDrawer === 'sync';
  const isRolesActive = location.pathname.includes('/app/roles');
  const isPresentationActive = location.pathname.includes('/app/presentation');

  return (
    <aside className="rail">
      <div
        className="rail-logo"
        title="Multi-Cloud Storage — click to refresh"
        onClick={onLogoClick}
      />

      <button
        className={`ri${isFilesActive ? ' on' : ''}`}
        data-tip="Files"
        onClick={() => { onDrawer(null); navigate('/app/files'); }}
      >
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M3 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
        </svg>
      </button>

      <div className="rail-sep" />

      {can('sync') && (
        <button
          className={`ri${isSyncActive ? ' on' : ''}`}
          data-tip="Sync"
          onClick={() => { navigate('/app/files'); onDrawer('sync'); }}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
            <path d="M4 10a6 6 0 016-6 6 6 0 015.66 4M16 10a6 6 0 01-6 6 6 6 0 01-5.66-4"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M14.5 8l1.66-4 1.84 4M3.5 12l-1.66 4-1.84-4"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <button
        className={`ri${isPresentationActive ? ' on' : ''}`}
        data-tip="Presentation"
        onClick={() => { onDrawer(null); navigate('/app/presentation'); }}
      >
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
          <path d="M7 17h6M10 14v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M7.5 9.5L9.5 7.5l2 2 2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {can('manage_roles') && (
        <button
          className={`ri${isRolesActive ? ' on' : ''}`}
          data-tip="Roles"
          onClick={() => { onDrawer(null); navigate('/app/roles'); }}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
            <path d="M7 9a3 3 0 100-6 3 3 0 000 6zM2.5 17a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M14.5 8.5a2.5 2.5 0 100-5M13 17a3.8 3.8 0 014.5-3.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <div className="rail-btm">
        <button
          className="ri"
          data-tip={dark ? 'Light mode' : 'Dark mode'}
          onClick={toggleTheme}
        >
          {dark ? (
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none">
              <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41"
                stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" width="17" height="17" fill="none">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            </svg>
          )}
        </button>

        <button
          className="ri"
          data-tip="Sign out"
          onClick={() => { signOut(); navigate('/login'); }}
        >
          <svg viewBox="0 0 20 20" width="17" height="17" fill="none">
            <path d="M13 3h4a1 1 0 011 1v12a1 1 0 01-1 1h-4M8 14l4-4-4-4M12 10H3"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="rail-av" title={user?.username}>
          {user?.username?.[0]?.toUpperCase() ?? 'A'}
        </div>
      </div>
    </aside>
  );
}
