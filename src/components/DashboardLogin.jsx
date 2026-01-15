/**
 * @copyright 2024 Abdulkerim Erdurun
 * @license Apache-2.0
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import Lottie from 'lottie-react';

const DashboardLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  // Lottie animasyonunu yükle
  useState(() => {
    fetch('/lottie/Animation - 1750878537294.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(err => console.log('Lottie animasyon yüklenemedi:', err));
  }, []);

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
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 max-w-md w-full">
        {/* Main Card */}
        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/50 p-8 relative overflow-hidden">
          {/* Card Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl"></div>
          
          {/* Header with Lottie Animation */}
          <div className="text-center relative z-10">
            {/* Lottie Animation */}
            <div className="mx-auto w-48 h-48 mb-8 relative">
              {animationData ? (
                <div className="w-full h-full">
                  <Lottie 
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-pulse">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
              )}
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent mb-2">
            Dashboard Girişi
            </h1>
            <p className="text-zinc-400 text-sm mb-8">
              Portfolio yönetim paneline güvenli erişim
          </p>
        </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Password Field */}
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Güvenlik Şifresi
            </label>
              <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-600 rounded-xl text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Şifrenizi girin..."
              disabled={isLoading}
            />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
          </div>

            {/* Error Message */}
          {error && (
              <div className="relative">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm animate-shake">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
              {error}
                  </div>
                </div>
            </div>
          )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25 group"
            >
              {/* Button Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Doğrulanıyor...</span>
                  </>
              ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2m0 0V7a2 2 0 012-2h4a2 2 0 012 2v1M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                    </svg>
                    <span>Giriş Yap</span>
                  </>
              )}
              </div>
            </button>

            {/* Back to Home */}
            <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors duration-300 group"
            >
                <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Ana sayfaya dön
            </button>
          </div>
        </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-zinc-500 text-xs">
            © 2024 Abdulkerim Erdurun - Portfolio Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

// CSS animasyonları için stil ekleyelim
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);

DashboardLogin.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default DashboardLogin; 