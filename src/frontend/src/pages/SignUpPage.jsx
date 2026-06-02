import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getInvite, register } from '../api/index.js';
import { roleLabel } from '../roles.js';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const inviteToken = params.get('invite');
  const [invite, setInvite] = useState(null);
  const [inviteChecked, setInviteChecked] = useState(!inviteToken);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    let active = true;
    if (!inviteToken) {
      setInvite(null);
      setInviteChecked(true);
      return () => { active = false; };
    }

    setInviteChecked(false);
    getInvite(inviteToken)
      .then(result => {
        if (!active) return;
        setInvite(result && !result.usedBy ? result : null);
      })
      .catch(() => {
        if (active) setInvite(null);
      })
      .finally(() => {
        if (active) setInviteChecked(true);
      });

    return () => { active = false; };
  }, [inviteToken]);

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = 'Username is required.';
    if (!form.email)    errs.email    = 'Email is required.';
    if (!form.password) errs.password = 'Password is required.';
    if (form.password && form.password !== form.confirm)
      errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, inviteToken });
      setSuccess(true);
      setTimeout(() => navigate('/login', { state: { registered: form.username } }), 1800);
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      else setErrors({ global: err.message || 'Registration failed.' });
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
            <h2>Create account</h2>
            <span>Multi-Cloud Storage · Self-service</span>
          </div>
        </div>

        {inviteToken && inviteChecked && !invite && (
          <div className="alert a-err" style={{ marginBottom: 12 }}>
            Invalid invite link. You can still create a Viewer account.
          </div>
        )}

        {invite && inviteChecked && !success && (
          <div className="alert a-inf" style={{ marginBottom: 12 }}>
            This invite grants <strong>{roleLabel(invite.role)}</strong> access after signup.
          </div>
        )}

        {success ? (
          <div className="alert a-ok" style={{ marginBottom: 0 }}><span>
            ✓ Account created! Redirecting to sign in…
          </span></div>
        ) : (
          <>
            {errors.global && (
              <div className="alert a-err" style={{ marginBottom: 12 }}>⚠ {errors.global}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="fg">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="e.g. johndoe"
                  value={form.username}
                  onChange={set('username')}
                  className={errors.username ? 'err' : ''}
                  autoFocus
                  autoComplete="username"
                />
                {errors.username && <div style={{ fontSize: 11.5, color: 'var(--er)', marginTop: 4 }}>{errors.username}</div>}
              </div>

              <div className="fg">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className={errors.email ? 'err' : ''}
                  autoComplete="email"
                />
                {errors.email && <div style={{ fontSize: 11.5, color: 'var(--er)', marginTop: 4 }}>{errors.email}</div>}
              </div>

              <div className="fg">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  className={errors.password ? 'err' : ''}
                  autoComplete="new-password"
                />
                {errors.password && <div style={{ fontSize: 11.5, color: 'var(--er)', marginTop: 4 }}>{errors.password}</div>}
              </div>

              <div className="fg" style={{ marginBottom: 16 }}>
                <label>Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  className={errors.confirm ? 'err' : ''}
                  autoComplete="new-password"
                />
                {errors.confirm && <div style={{ fontSize: 11.5, color: 'var(--er)', marginTop: 4 }}>{errors.confirm}</div>}
              </div>

              <button className="btn btn-p btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            <div className="demob" style={{ textAlign: 'center', marginTop: 13 }}>
              New accounts are granted <strong>{invite ? roleLabel(invite.role) : 'Viewer'}</strong> role.
              <br />
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--ac)', fontWeight: 700, textDecoration: 'none' }}>
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
