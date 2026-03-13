import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { OwnerDashboard } from './pages/OwnerDashboard';

type Page = 'landing' | 'home' | 'dashboard';

function App() {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'dashboard') {
        setCurrentPage('dashboard');
      } else if (hash === 'home') {
        setCurrentPage('home');
      } else {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    if (showAuth === 'login') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <Login onToggle={() => setShowAuth('register')} />
        </div>
      );
    }

    if (showAuth === 'register') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
          <Register onToggle={() => setShowAuth('login')} />
        </div>
      );
    }

    return (
      <LandingPage
        onLoginClick={() => setShowAuth('login')}
        onRegisterClick={() => setShowAuth('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {currentPage === 'dashboard' && profile.user_type === 'owner' ? (
        <OwnerDashboard />
      ) : (
        <HomePage />
      )}
    </div>
  );
}

export default App;
