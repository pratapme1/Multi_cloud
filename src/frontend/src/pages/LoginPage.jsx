import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const registeredUser = location.state?.registered;
  const [username, setUsername] = useState(registeredUser ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      await signIn(username, password);
      navigate('/app/files');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lwrap">
      <div className="lcard">
        <div className="lbrand">
          <div className="lmark" />
          <div>
            <h2>Multi-Cloud Storage</h2>
            <span>AWS · Azure · Google Cloud</span>
          </div>
        </div>
        <div className="lchips">
          <span className="lchip" style={{ background: 'rgba(255,153,0,.13)', color: '#b45309', border: '1px solid rgba(255,153,0,.26)' }}>● AWS S3</span>
          <span className="lchip" style={{ background: 'rgba(0,120,212,.11)', color: '#1d4ed8', border: '1px solid rgba(0,120,212,.24)' }}>● Azure Blob</span>
          <span className="lchip" style={{ background: 'rgba(52,168,83,.11)', color: '#166534', border: '1px solid rgba(52,168,83,.24)' }}>● GCS</span>
        </div>
        {registeredUser && !error && (
          <div className="alert a-ok" style={{ marginBottom: 12 }}><span>
            ✓ Account <strong>{registeredUser}</strong> created — sign in to continue.
          </span></div>
        )}
        {error && (
          <div className="alert a-err" style={{ marginBottom: 12 }}>⚠ Invalid username or password.</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className={error ? 'err' : ''}
              autoFocus
            />
          </div>
          <div className="fg" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={error ? 'err' : ''}
            />
          </div>
          <button className="btn btn-p btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--tx3)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--ac)', fontWeight: 700, textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
