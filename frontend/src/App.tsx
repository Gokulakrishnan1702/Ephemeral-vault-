import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { CreateSecretPage } from './pages/CreateSecretPage.js';
import { SecretCreatedPage } from './pages/SecretCreatedPage.js';
import { ViewSecretPage } from './pages/ViewSecretPage.js';
import { MySecretsPage } from './pages/MySecretsPage.js';
import { SecurityCenterPage } from './pages/SecurityCenterPage.js';
import { CliHelperPage } from './pages/CliHelperPage.js';
import { DocumentationPage } from './pages/DocumentationPage.js';
import { ArchitecturePage } from './pages/ArchitecturePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AboutPage } from './pages/AboutPage.js';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewSecretId, setViewSecretId] = useState<string>('');
  const [createdSecretData, setCreatedSecretData] = useState<any>(null);
  const [returnUrl, setReturnUrl] = useState<string>('my-secrets');

  const { user, loading: authLoading } = useAuth();

  // Parse path on initial load & handle browser navigation
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path.startsWith('/view/')) {
        const id = path.replace('/view/', '').trim();
        if (id) {
          setViewSecretId(id);
          setCurrentView('view-secret');
          return;
        }
      } else if (path === '/create') {
        setCurrentView('create');
      } else if (path === '/my-secrets' || path === '/dashboard') {
        setCurrentView('my-secrets');
      } else if (path === '/security' || path === '/security-test') {
        setCurrentView('security');
      } else if (path === '/cli') {
        setCurrentView('cli');
      } else if (path === '/docs') {
        setCurrentView('docs');
      } else if (path === '/architecture') {
        setCurrentView('architecture');
      } else if (path === '/login') {
        setCurrentView('login');
      } else if (path === '/signup') {
        setCurrentView('signup');
      } else if (path === '/forgot-password') {
        setCurrentView('forgot-password');
      } else if (path === '/settings') {
        setCurrentView('settings');
      } else if (path === '/about') {
        setCurrentView('about');
      } else {
        setCurrentView('home');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // Route protection: /my-secrets, /dashboard, and /settings require login
  useEffect(() => {
    if (!authLoading) {
      if ((currentView === 'my-secrets' || currentView === 'settings') && !user) {
        setReturnUrl(currentView);
        setCurrentView('login');
        window.history.pushState({}, '', '/login');
      }
    }
  }, [currentView, user, authLoading]);

  const navigateTo = (view: string, params?: any) => {
    const target = view === 'dashboard' ? 'my-secrets' : view;

    // Route protection check: require login for my-secrets, dashboard, settings
    if ((target === 'my-secrets' || target === 'settings') && !user && !authLoading) {
      setReturnUrl(target);
      setCurrentView('login');
      window.history.pushState({}, '', '/login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(target);
    if (target === 'home') {
      window.history.pushState({}, '', '/');
    } else if (target === 'view-secret' && params?.id) {
      setViewSecretId(params.id);
      window.history.pushState({}, '', `/view/${params.id}`);
    } else {
      window.history.pushState({}, '', `/${target}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050711] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar currentView={currentView} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage onNavigate={navigateTo} />
        )}

        {currentView === 'create' && (
          <CreateSecretPage
            onSuccess={(data) => {
              setCreatedSecretData(data);
              setCurrentView('secret-created');
            }}
          />
        )}

        {currentView === 'secret-created' && createdSecretData && (
          <SecretCreatedPage
            data={createdSecretData}
            onReset={() => navigateTo('create')}
            onNavigateToView={(id) => navigateTo('view-secret', { id })}
          />
        )}

        {currentView === 'view-secret' && (
          <ViewSecretPage
            secretId={viewSecretId}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'my-secrets' && (
          <MySecretsPage
            onNavigateToCreate={() => navigateTo('create')}
            onNavigateToView={(id) => navigateTo('view-secret', { id })}
          />
        )}

        {currentView === 'security' && (
          <SecurityCenterPage />
        )}

        {currentView === 'cli' && (
          <CliHelperPage />
        )}

        {currentView === 'docs' && (
          <DocumentationPage />
        )}

        {currentView === 'architecture' && (
          <ArchitecturePage />
        )}

        {currentView === 'login' && (
          <LoginPage
            initialMode="login"
            onSuccess={() => navigateTo(returnUrl || 'my-secrets')}
            onNavigateToForgotPassword={() => navigateTo('forgot-password')}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'signup' && (
          <LoginPage
            initialMode="signup"
            onSuccess={() => navigateTo(returnUrl || 'my-secrets')}
            onNavigateToForgotPassword={() => navigateTo('forgot-password')}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordPage
            onNavigateToLogin={() => navigateTo('login')}
            onNavigateToHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'settings' && (
          <SettingsPage />
        )}

        {currentView === 'about' && (
          <AboutPage />
        )}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
