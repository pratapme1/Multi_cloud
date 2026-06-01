import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Rail from './components/Rail.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import FilesPage from './pages/FilesPage.jsx';

function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppShell() {
  const [drawer, setDrawer]       = useState(null);
  const [selIdx, setSelIdx]       = useState(-1);
  const [refreshKey, setRefresh]  = useState(0);
  const navigate = useNavigate();

  const openDrawer  = mode => { setDrawer(mode); if (mode !== 'file') setSelIdx(-1); };
  const closeDrawer = ()   => { setDrawer(null); setSelIdx(-1); };
  const selectFile  = i   => { setSelIdx(i); setDrawer('file'); };

  const handleLogoClick = useCallback(() => {
    closeDrawer();
    setRefresh(k => k + 1);
    navigate('/app/files');
  }, [navigate]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app">
      <Rail activeDrawer={drawer} onDrawer={openDrawer} onLogoClick={handleLogoClick} />
      <main className="main">
        <FilesPage
          drawer={drawer}
          selIdx={selIdx}
          onDrawer={openDrawer}
          onSelectFile={selectFile}
          onCloseDrawer={closeDrawer}
          refreshKey={refreshKey}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login"  element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/app/*" element={<AppShell />} />
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
