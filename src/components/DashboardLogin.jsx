/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useState } from 'react';
import PropTypes from 'prop-types';

const DashboardLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Environment'dan şifreyi al
    const correctPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'kerimoski2024';

    // Kısa gecikme simülasyonu (güvenlik için)
    setTimeout(() => {
      if (password === correctPassword) {
        onLogin(true);
        localStorage.setItem('dashboard-auth', 'true');
        localStorage.setItem('dashboard-auth-time', Date.now().toString());
      } else {
        setError('Yanlış şifre! Tekrar deneyin.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-zinc-800">
            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Dashboard Girişi
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Portfolio yönetim paneline erişim için şifre gerekli
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-field w-full"
              placeholder="Dashboard şifresi"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  Kontrol ediliyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              ← Ana sayfaya dön
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DashboardLogin.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default DashboardLogin; 